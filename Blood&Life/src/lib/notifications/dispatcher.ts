/**
 * Unified Smart Emergency Notification Dispatcher
 * Coordinates Targeted Matched Donor Email, In-App, Web Push, and Telegram channels
 * with area + availability + cooldown + blood group matching and tiered fallbacks.
 */

import { connectDB } from "@/lib/db";
import { Notification } from "@/models/Notification";
import { PushSubscription } from "@/models/PushSubscription";
import { User } from "@/models/User";
import { sendWebPush } from "@/lib/notifications/webPush";
import { broadcastTelegramEmergencyAlert } from "@/lib/notifications/broadcast";
import { sendTransactionalEmail, sendBatchTransactionalEmails, SendEmailParams } from "@/lib/notifications/email";
import {
  buildUrgentMatchEmailTemplate,
  buildPledgeAlertEmailTemplate,
  buildRequestVerificationEmailTemplate,
  buildDonationVerifiedEmailTemplate,
} from "@/lib/notifications/emailTemplates";
import { escapeRegex } from "@/lib/security/sanitize";
import { getLocationAliases, resolveDivisionForDistrict } from "@/lib/geo/bangladeshData";

// Compatible donor blood groups for critical red-cell/whole-blood emergencies
const COMPATIBLE_DONOR_MAP: Record<string, string[]> = {
  "AB+": ["A+", "B+", "O+", "AB-", "A-", "B-", "O-"],
  "AB-": ["A-", "B-", "O-"],
  "A+": ["A-", "O+", "O-"],
  "A-": ["O-"],
  "B+": ["B-", "O+", "O-"],
  "B-": ["O-"],
  "O+": ["O-"],
  "O-": [],
};

function buildRegexList(aliases: string[]): RegExp[] {
  return aliases.map((a) => new RegExp(`^${escapeRegex(a)}$`, "i"));
}

export interface EmergencyRequestDispatchParams {
  requestId: string;
  recipientName: string;
  bloodGroup: string;
  unitsNeeded: number;
  hospital: string;
  division?: string;
  district: string;
  upazila?: string;
  urgency: string;
  bloodComponent?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  medicalReason?: string;
  message?: string;
  requesterId: string;
  requesterName?: string;
  requesterPhone?: string;
  isVerifiedGenuine?: boolean;
}

export async function dispatchEmergencyRequestAlerts(params: EmergencyRequestDispatchParams) {
  const {
    requestId,
    recipientName,
    bloodGroup,
    unitsNeeded,
    hospital,
    division,
    district,
    upazila,
    urgency,
    bloodComponent = "whole_blood",
    scheduledDate,
    scheduledTime,
    medicalReason,
    message,
    requesterId,
    requesterName,
    requesterPhone,
    isVerifiedGenuine = false,
  } = params;

  try {
    await connectDB();

    const now = new Date();
    const resolvedDivision = division || resolveDivisionForDistrict(district) || "";
    const districtAliases = getLocationAliases("district", district);
    const divisionAliases = getLocationAliases("division", resolvedDivision);
    const upazilaAliases = getLocationAliases("upazila", upazila);

    const districtRegexes = buildRegexList(districtAliases.length ? districtAliases : [district]);
    const divisionRegexes = buildRegexList(divisionAliases);
    const upazilaLowerSet = new Set(upazilaAliases.map((u) => u.toLowerCase()));

    // 1. In-App Notification for Requester Confirmation
    const requesterNotifPromise = Notification.create({
      recipientId: requesterId,
      category: "MATCH",
      titleEn: "Emergency Request Broadcasted 🩸",
      titleBn: "জরুরী রক্তের আবেদন প্রচারিত হয়েছে 🩸",
      messageEn: `Your SOS for ${unitsNeeded} bag(s) of ${bloodGroup} at ${hospital} is live and dispatched to matched regional donors.`,
      messageBn: `${hospital}-এ ${unitsNeeded} ব্যাগ ${bloodGroup} রক্তের জন্য আপনার জরুরী আবেদনটি সংশ্লিষ্ট এলাকার রক্তদাতাদের কাছে পাঠানো হয়েছে।`,
      link: `/requests/${requestId}`,
      isRead: false,
    });

    // 2. Telegram Regional Community Broadcast
    const telegramPromise = broadcastTelegramEmergencyAlert({
      bloodGroup,
      units: unitsNeeded,
      hospital,
      district,
      patientName: recipientName,
      requestId,
    });

    // 3. Web Push to Matching Regional Subscribers (Case-insensitive District + BloodGroup)
    const pushPromise = (async () => {
      try {
        const subscriptions = await PushSubscription.find({
          $and: [
            {
              $or: [
                { district: { $in: districtRegexes } },
                { district: "all" },
                { district: { $exists: false } },
              ],
            },
            {
              $or: [{ bloodGroup }, { bloodGroup: "all" }, { bloodGroup: { $exists: false } }],
            },
          ],
        }).limit(200);

        const pushPayload = {
          title: `🚨 জরুরী ${bloodGroup} রক্তের আবেদন — ${district}`,
          body: `${hospital}-এ রোগী ${recipientName}-এর জন্য ${unitsNeeded} ব্যাগ ${bloodGroup} রক্ত প্রয়োজন।`,
          tag: `sos-${requestId}`,
          url: `/requests/${requestId}`,
        };

        return await Promise.allSettled(
          subscriptions.map(async (sub) => {
            const res = await sendWebPush(sub, pushPayload);
            if (!res.success && (res.error?.includes("410") || res.error?.includes("404"))) {
              await PushSubscription.deleteOne({ _id: sub._id });
            }
            return res;
          })
        );
      } catch (err) {
        console.error("Web Push fanout error:", err);
      }
    })();

    // 4. Smart Tiered Matched Donor Resolution (In-App + Targeted Personalized Email)
    const matchedDonorFanoutPromise = (async () => {
      try {
        const baseEligibleQuery: Record<string, unknown> = {
          status: "Active",
          isAvailable: true,
          isFraudFlagged: { $ne: true },
          _id: { $ne: requesterId },
          $or: [{ cooldownUntil: { $exists: false } }, { cooldownUntil: { $lte: now } }],
        };

        const seenIds = new Set<string>();
        interface MatchedRecipient {
          donor: any;
          tierLabel: string;
          isNearUpazila: boolean;
        }
        const matchedRecipients: MatchedRecipient[] = [];

        // Tier 1: Same District + Exact Blood Group
        const tier1Donors = await User.find({
          ...baseEligibleQuery,
          bloodGroup: bloodGroup as any,
          district: { $in: districtRegexes },
        })
          .select("name email bloodGroup district upazila isEmailVerified emailNotifications role")
          .lean();

        // Prioritize same-upazila ("Near Donor") first within Tier 1
        tier1Donors.sort((a: any, b: any) => {
          const aNear = a.upazila && upazilaLowerSet.has(String(a.upazila).toLowerCase()) ? 1 : 0;
          const bNear = b.upazila && upazilaLowerSet.has(String(b.upazila).toLowerCase()) ? 1 : 0;
          return bNear - aNear;
        });

        for (const d of tier1Donors) {
          const idStr = String(d._id);
          if (seenIds.has(idStr)) continue;
          seenIds.add(idStr);
          const isNear = Boolean(d.upazila && upazilaLowerSet.has(String(d.upazila).toLowerCase()));
          matchedRecipients.push({
            donor: d,
            isNearUpazila: isNear,
            tierLabel: isNear
              ? `📍 নিকটস্থ রক্তদাতা (${upazila || d.upazila}, ${district}) • ${bloodGroup} ম্যাচ`
              : `🎯 একই জেলা (${district}) • ${bloodGroup} ম্যাচ`,
          });
        }

        // Tier 2: Same Division Expansion (if < 5 local matches OR urgency is critical)
        if (divisionRegexes.length > 0 && (matchedRecipients.length < 5 || urgency === "critical")) {
          const tier2Donors = await User.find({
            ...baseEligibleQuery,
            bloodGroup: bloodGroup as any,
            division: { $in: divisionRegexes },
          })
            .select("name email bloodGroup district upazila isEmailVerified emailNotifications role")
            .limit(80)
            .lean();

          for (const d of tier2Donors) {
            const idStr = String(d._id);
            if (seenIds.has(idStr)) continue;
            seenIds.add(idStr);
            matchedRecipients.push({
              donor: d,
              isNearUpazila: false,
              tierLabel: `🗺️ আপনার বিভাগ (${resolvedDivision}) • ${bloodGroup} জরুরি ম্যাচ`,
            });
          }
        }

        // Tier 3: Compatible Blood Group in District (only if critical and exact matches < 3 for RBC/Whole Blood)
        if (
          urgency === "critical" &&
          matchedRecipients.length < 3 &&
          (bloodComponent === "whole_blood" || bloodComponent === "prbc")
        ) {
          const compatGroups = COMPATIBLE_DONOR_MAP[bloodGroup] || [];
          if (compatGroups.length > 0) {
            const tier3Donors = await User.find({
              ...baseEligibleQuery,
              bloodGroup: { $in: compatGroups as any },
              district: { $in: districtRegexes },
            })
              .select("name email bloodGroup district upazila isEmailVerified emailNotifications role")
              .limit(40)
              .lean();

            for (const d of tier3Donors) {
              const idStr = String(d._id);
              if (seenIds.has(idStr)) continue;
              seenIds.add(idStr);
              matchedRecipients.push({
                donor: d,
                isNearUpazila: false,
                tierLabel: `🩸 জরুরি কম্প্যাটিবল ম্যাচ (${d.bloodGroup} -> ${bloodGroup}) • ${district}`,
              });
            }
          }
        }

        // Tier 4: District/Division Volunteers for rapid prescription verification
        const volunteerAlerts = await User.find({
          status: "Active",
          role: { $in: ["Volunteer", "Admin"] },
          _id: { $ne: requesterId },
          $or: [{ district: { $in: districtRegexes } }, { division: { $in: divisionRegexes } }],
        })
          .select("_id name email isEmailVerified emailNotifications")
          .limit(15)
          .lean();

        // 4A. In-App Notification Fanout (Donors + Local Volunteers)
        const inAppDocs: any[] = matchedRecipients.map(({ donor, isNearUpazila }) => ({
          recipientId: String(donor._id),
          category: "MATCH" as const,
          titleEn: isNearUpazila
            ? `📍 Near You: Emergency ${bloodGroup} Needed (${upazila || district})`
            : `🚨 Emergency ${bloodGroup} Needed in ${district}`,
          titleBn: isNearUpazila
            ? `📍 আপনার এলাকায় জরুরি ${bloodGroup} রক্ত প্রয়োজন (${upazila || district})`
            : `🚨 ${district}-এ জরুরি ${bloodGroup} রক্ত প্রয়োজন`,
          messageEn: `Patient ${recipientName} urgently requires ${unitsNeeded} unit(s) at ${hospital}. Click to pledge and save a life.`,
          messageBn: `${hospital}-এ রোগী ${recipientName}-এর জন্য ${unitsNeeded} ব্যাগ ${bloodGroup} রক্তের প্রয়োজন। এখনই রক্ত দিন।`,
          link: `/requests/${requestId}`,
          isRead: false,
        }));

        for (const v of volunteerAlerts) {
          if (!seenIds.has(String(v._id))) {
            inAppDocs.push({
              recipientId: String(v._id),
              category: "SYSTEM" as const,
              titleEn: `🛡️ Triage Needed: ${bloodGroup} SOS in ${district}`,
              titleBn: `🛡️ যাচাই প্রয়োজন: ${district}-এ ${bloodGroup} আবেদন`,
              messageEn: `New blood request for ${recipientName} at ${hospital} awaits volunteer prescription verification.`,
              messageBn: `${hospital}-এ রোগী ${recipientName}-এর আবেদনটি ভেরিফিকেশনের জন্য অপেক্ষমান।`,
              link: `/dashboard/volunteer`,
              isRead: false,
            });
          }
        }

        if (inAppDocs.length > 0) {
          await Notification.insertMany(inAppDocs, { ordered: false }).catch((e) =>
            console.error("In-app bulk insert notice:", e)
          );
        }

        // 4B. Personalized Email Batch Dispatch to Verified & Opted-In Matched Donors
        const emailPayloads: SendEmailParams[] = [];
        for (const { donor, tierLabel, isNearUpazila } of matchedRecipients) {
          const email = (donor.email || "").trim().toLowerCase();
          if (
            !email ||
            email.endsWith("@bloodlife.local") ||
            donor.isEmailVerified === false ||
            donor.emailNotifications === false
          ) {
            continue;
          }

          const template = buildUrgentMatchEmailTemplate({
            donorName: donor.name,
            patientName: recipientName,
            bloodGroup,
            unitsNeeded,
            bloodComponent,
            urgency,
            hospital,
            upazila,
            district,
            division: resolvedDivision,
            scheduledDate,
            scheduledTime,
            medicalReason,
            message,
            requesterName,
            requesterPhone,
            isVerifiedGenuine,
            caseId: requestId,
            matchTierLabel: tierLabel,
          });

          const prefix = urgency === "critical" ? "🚨 [CRITICAL]" : "🩸 [জরুরি রক্তের আবেদন]";
          const nearTag = isNearUpazila ? " (আপনার এলাকায়)" : "";
          emailPayloads.push({
            to: email,
            subject: `${prefix} ${unitsNeeded} ব্যাগ ${bloodGroup} প্রয়োজন — ${hospital}, ${district}${nearTag}`,
            html: template.html,
            text: template.text,
          });
        }

        if (emailPayloads.length > 0) {
          await sendBatchTransactionalEmails(emailPayloads);
        }
      } catch (err) {
        console.error("Matched donor fanout error:", err);
      }
    })();

    // Execute all channels concurrently with failure isolation
    await Promise.allSettled([
      requesterNotifPromise,
      telegramPromise,
      pushPromise,
      matchedDonorFanoutPromise,
    ]);
  } catch (error) {
    console.error("Critical failure in emergency alert dispatcher:", error);
  }
}

interface PledgeDispatchParams {
  requestId: string;
  recipientName: string;
  requesterId: string;
  donorName: string;
  donorBloodGroup: string;
  donorPhone?: string;
  hospital: string;
}

export async function dispatchPledgeAlerts({
  requestId,
  recipientName,
  requesterId,
  donorName,
  donorBloodGroup,
  donorPhone,
  hospital,
}: PledgeDispatchParams) {
  try {
    await connectDB();

    // 1. In-App Notification for Patient Relative
    const notifPromise = Notification.create({
      recipientId: requesterId,
      category: "PLEDGE",
      titleEn: `Donor Pledged Blood! 🩸 (${donorBloodGroup})`,
      titleBn: `রক্তদাতা পাওয়া গেছে! 🩸 (${donorBloodGroup})`,
      messageEn: `${donorName} has stepped up and pledged to donate blood for ${recipientName} at ${hospital}.`,
      messageBn: `${donorName} (${donorBloodGroup}) ${hospital}-এ আপনার রোগীর জন্য রক্তদানের অঙ্গীকার করেছেন। যোগাযোগ করতে বিস্তারিত দেখুন।`,
      link: `/requests/${requestId}`,
      isRead: false,
    });

    // 2. Web Push to ALL Requester Devices
    const pushPromise = (async () => {
      try {
        const subs = await PushSubscription.find({ userId: requesterId });
        await Promise.allSettled(
          subs.map(async (sub) => {
            const res = await sendWebPush(sub, {
              title: `🩸 রক্তদাতা পাওয়া গেছে! (${donorBloodGroup})`,
              body: `${donorName} আপনার আবেদনের জন্য রক্তদানের অঙ্গীকার করেছেন।`,
              url: `/requests/${requestId}`,
            });
            if (!res.success && (res.error?.includes("410") || res.error?.includes("404"))) {
              await PushSubscription.deleteOne({ _id: sub._id });
            }
          })
        );
      } catch (err) {
        console.error("Requester push error:", err);
      }
    })();

    // 3. Email Notification to Requester
    const emailPromise = (async () => {
      try {
        const requester = await User.findById(requesterId)
          .select("name email isEmailVerified emailNotifications")
          .lean();
        if (
          requester?.email &&
          !requester.email.endsWith("@bloodlife.local") &&
          requester.isEmailVerified !== false &&
          requester.emailNotifications !== false
        ) {
          const content = buildPledgeAlertEmailTemplate({
            requesterName: requester.name,
            patientName: recipientName,
            donorName,
            donorBloodGroup,
            donorPhone,
            hospital,
            caseId: requestId,
          });
          await sendTransactionalEmail({
            to: requester.email,
            subject: `🩸 রক্তদাতা পাওয়া গেছে! ${donorName} (${donorBloodGroup}) — ${hospital}`,
            html: content.html,
            text: content.text,
          });
        }
      } catch (err) {
        console.error("Requester pledge email error:", err);
      }
    })();

    await Promise.allSettled([notifPromise, pushPromise, emailPromise]);
  } catch (err) {
    console.error("Pledge dispatch error:", err);
  }
}

export async function dispatchPledgeWithdrawnAlerts({
  requestId,
  recipientName,
  requesterId,
  donorName,
  hospital,
}: {
  requestId: string;
  recipientName: string;
  requesterId: string;
  donorName: string;
  hospital: string;
}) {
  try {
    await connectDB();
    await Notification.create({
      recipientId: requesterId,
      category: "SYSTEM",
      titleEn: "Donor Pledge Withdrawn",
      titleBn: "রক্তদাতার অঙ্গীকার প্রত্যাহার",
      messageEn: `${donorName} had to withdraw their pledge for ${recipientName} at ${hospital}. Your request remains open for other donors.`,
      messageBn: `${donorName} ${hospital}-এ ${recipientName}-এর জন্য রক্তদানের অঙ্গীকার প্রত্যাহার করেছেন। আপনার আবেদনটি পুনরায় সক্রিয় আছে।`,
      link: `/requests/${requestId}`,
      isRead: false,
    });
  } catch (err) {
    console.error("Pledge withdrawn alert error:", err);
  }
}

interface VerificationDispatchParams {
  requestId: string;
  requesterId: string;
  recipientName?: string;
  hospital?: string;
  action: "VERIFY" | "REJECT";
  rejectReason?: string;
}

export async function dispatchVerificationAlerts({
  requestId,
  requesterId,
  recipientName = "রোগী",
  hospital = "হাসপাতাল",
  action,
  rejectReason,
}: VerificationDispatchParams) {
  try {
    await connectDB();

    const notifPromise =
      action === "VERIFY"
        ? Notification.create({
            recipientId: requesterId,
            category: "VERIFIED",
            titleEn: "Medical Request Verified Genuine ✅",
            titleBn: "আবেদন ভেরিফাইড ও অনুমোদিত ✅",
            messageEn: "Your transfusion request has been reviewed and verified by a volunteer coordinator.",
            messageBn: "স্বেচ্ছাসেবক কর্তৃক আপনার প্রেসক্রিপশন যাচাই ও ভেরিফাইড হিসেবে অনুমোদিত হয়েছে।",
            link: `/requests/${requestId}`,
            isRead: false,
          })
        : Notification.create({
            recipientId: requesterId,
            category: "SYSTEM",
            titleEn: "Request Canceled / Rejected",
            titleBn: "আবেদন বাতিল করা হয়েছে",
            messageEn: `Your emergency request was rejected by a coordinator. Reason: ${rejectReason || "Invalid verification document"}.`,
            messageBn: `আপনার আবেদনটি বাতিল করা হয়েছে। কারণ: ${rejectReason || "প্রেসক্রিপশন অস্পষ্ট বা ভেরিফাই করা যায়নি"}।`,
            link: `/requests/${requestId}`,
            isRead: false,
          });

    const emailPromise = (async () => {
      try {
        const requester = await User.findById(requesterId)
          .select("name email isEmailVerified emailNotifications")
          .lean();
        if (
          requester?.email &&
          !requester.email.endsWith("@bloodlife.local") &&
          requester.isEmailVerified !== false &&
          requester.emailNotifications !== false
        ) {
          const content = buildRequestVerificationEmailTemplate({
            requesterName: requester.name,
            patientName: recipientName,
            hospital,
            action,
            rejectReason,
            caseId: requestId,
          });
          await sendTransactionalEmail({
            to: requester.email,
            subject:
              action === "VERIFY"
                ? `✅ আপনার রক্তের আবেদন ভেরিফাইড হয়েছে — ${hospital}`
                : `❌ আপনার রক্তের আবেদন বাতিল হয়েছে — ${hospital}`,
            html: content.html,
            text: content.text,
          });
        }
      } catch (err) {
        console.error("Verification email error:", err);
      }
    })();

    await Promise.allSettled([notifPromise, emailPromise]);
  } catch (err) {
    console.error("Verification dispatch error:", err);
  }
}

export async function dispatchDonationVerifiedAlerts({
  donorId,
  donorName,
  donorEmail,
  patientName,
  hospital,
  bloodGroup,
  rating,
  certificateId,
}: {
  donorId: string;
  donorName: string;
  donorEmail?: string;
  patientName: string;
  hospital: string;
  bloodGroup: string;
  rating: number;
  certificateId: string;
}) {
  try {
    await connectDB();

    const notifPromise = Notification.create({
      recipientId: donorId,
      category: "VERIFIED",
      titleEn: `Donation Verified (${rating}★) 🏆`,
      titleBn: `রক্তদান ভেরিফাইড হয়েছে (${rating}★) 🏆`,
      messageEn: `Your ${bloodGroup} donation for ${patientName} at ${hospital} was verified by the recipient. Certificate #${certificateId} issued!`,
      messageBn: `${hospital}-এ ${patientName}-এর জন্য আপনার ${bloodGroup} রক্তদান ভেরিফাই করা হয়েছে এবং সনদ #${certificateId} ইস্যু হয়েছে!`,
      link: `/verify-cert/${certificateId}`,
      isRead: false,
    });

    const emailPromise = (async () => {
      if (donorEmail && !donorEmail.endsWith("@bloodlife.local")) {
        const content = buildDonationVerifiedEmailTemplate({
          donorName,
          patientName,
          hospital,
          bloodGroup,
          rating,
          certificateId,
        });
        await sendTransactionalEmail({
          to: donorEmail,
          subject: `🏆 আপনার রক্তদান ভেরিফাইড হয়েছে (${rating}★) — সনদ #${certificateId}`,
          html: content.html,
          text: content.text,
        });
      }
    })();

    await Promise.allSettled([notifPromise, emailPromise]);
  } catch (err) {
    console.error("Donation verified dispatch error:", err);
  }
}
