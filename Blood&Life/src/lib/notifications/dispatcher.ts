/**
 * Unified Emergency Notification Dispatcher
 * Coordinates In-App, Web Push, Telegram, and Email channels with failure isolation.
 */

import { connectDB } from "@/lib/db";
import { Notification } from "@/models/Notification";
import { PushSubscription } from "@/models/PushSubscription";
import { User } from "@/models/User";
import { sendWebPush } from "@/lib/notifications/webPush";
import { broadcastTelegramEmergencyAlert } from "@/lib/notifications/broadcast";

interface EmergencyRequestDispatchParams {
  requestId: string;
  recipientName: string;
  bloodGroup: string;
  unitsNeeded: number;
  hospital: string;
  district: string;
  urgency: string;
  requesterId: string;
}

export async function dispatchEmergencyRequestAlerts({
  requestId,
  recipientName,
  bloodGroup,
  unitsNeeded,
  hospital,
  district,
  urgency,
  requesterId,
}: EmergencyRequestDispatchParams) {
  try {
    await connectDB();

    // 1. In-App Notification for Requester Confirmation
    const requesterNotifPromise = Notification.create({
      recipientId: requesterId,
      category: "MATCH",
      titleEn: "Emergency Request Broadcasted 🩸",
      titleBn: "জরুরী রক্তের আবেদন প্রচারিত হয়েছে 🩸",
      messageEn: `Your SOS for ${unitsNeeded} bag(s) of ${bloodGroup} at ${hospital} is live and dispatched to regional donors.`,
      messageBn: `${hospital}-এ ${unitsNeeded} ব্যাগ ${bloodGroup} রক্তের জন্য আপনার জরুরী আবেদনটি সম্প্রচারিত হয়েছে।`,
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

    // 3. Web Push to Matching Regional Donors
    const pushPromise = (async () => {
      try {
        const subscriptions = await PushSubscription.find({
          $or: [
            { district: district, bloodGroup: bloodGroup },
            { district: district, bloodGroup: "all" },
            { district: "all" },
          ],
        }).limit(200);

        const pushPayload = {
          title: `🚨 জরুরী ${bloodGroup} রক্তের আবেদন — ${district}`,
          body: `${hospital}-এ রোগী ${recipientName}-এর জন্য ${unitsNeeded} ব্যাগ ${bloodGroup} রক্ত প্রয়োজন। দ্রুত বিস্তারিত দেখুন।`,
          tag: `sos-${requestId}`,
          url: `/requests/${requestId}`,
        };

        const results = await Promise.allSettled(
          subscriptions.map(async (sub) => {
            const res = await sendWebPush(sub, pushPayload);
            // If subscription has expired or is unsubscribed (HTTP 410 or 404), prune it
            if (!res.success && (res.error?.includes("410") || res.error?.includes("404"))) {
              await PushSubscription.deleteOne({ _id: sub._id });
            }
            return res;
          })
        );
        return results;
      } catch (err) {
        console.error("Web Push fanout error:", err);
      }
    })();

    // 4. In-App Fanout to Active Regional Registered Donors
    const inAppFanoutPromise = (async () => {
      try {
        const matchingDonors = await User.find({
          district: district,
          bloodGroup: bloodGroup as any,
          status: "Active",
          isAvailable: true,
          _id: { $ne: requesterId },
        })
          .select("_id")
          .limit(50)
          .lean();

        if (matchingDonors.length > 0) {
          const donorNotifDocs = matchingDonors.map((d: any) => ({
            recipientId: String(d._id),
            category: "MATCH" as const,
            titleEn: `🚨 Emergency ${bloodGroup} Needed in ${district}`,
            titleBn: `🚨 আপনার এলাকায় জরুরী ${bloodGroup} রক্ত প্রয়োজন`,
            messageEn: `Patient ${recipientName} urgently requires ${unitsNeeded} unit(s) at ${hospital}. Click to pledge and save a life.`,
            messageBn: `${hospital}-এ রোগী ${recipientName}-এর জন্য ${unitsNeeded} ব্যাগ ${bloodGroup} রক্তের প্রয়োজন। এখনই রক্ত দিন।`,
            link: `/requests/${requestId}`,
            isRead: false,
          }));

          await Notification.insertMany(donorNotifDocs, { ordered: false });
        }
      } catch (err) {
        console.error("In-App donor fanout error:", err);
      }
    })();

    // Execute concurrently with failure isolation
    await Promise.allSettled([
      requesterNotifPromise,
      telegramPromise,
      pushPromise,
      inAppFanoutPromise,
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
  hospital: string;
}

export async function dispatchPledgeAlerts({
  requestId,
  recipientName,
  requesterId,
  donorName,
  donorBloodGroup,
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

    // 2. Direct Web Push to Requester if subscribed
    const pushPromise = (async () => {
      try {
        const sub = await PushSubscription.findOne({ userId: requesterId });
        if (sub) {
          await sendWebPush(sub, {
            title: `🩸 রক্তদাতা পাওয়া গেছে! (${donorBloodGroup})`,
            body: `${donorName} আপনার আবেদনের জন্য রক্তদানের অঙ্গীকার করেছেন।`,
            url: `/requests/${requestId}`,
          });
        }
      } catch (err) {
        console.error("Requester push error:", err);
      }
    })();

    await Promise.allSettled([notifPromise, pushPromise]);
  } catch (err) {
    console.error("Pledge dispatch error:", err);
  }
}

interface VerificationDispatchParams {
  requestId: string;
  requesterId: string;
  action: "VERIFY" | "REJECT";
  rejectReason?: string;
}

export async function dispatchVerificationAlerts({
  requestId,
  requesterId,
  action,
  rejectReason,
}: VerificationDispatchParams) {
  try {
    await connectDB();

    if (action === "VERIFY") {
      await Notification.create({
        recipientId: requesterId,
        category: "VERIFIED",
        titleEn: "Medical Request Verified Genuine ✅",
        titleBn: "আবেদন ভেরিফাইড ও অনুমোদিত ✅",
        messageEn: "Your transfusion request has been reviewed and verified by a volunteer coordinator.",
        messageBn: "স্বেচ্ছাসেবক কর্তৃক আপনার প্রেসক্রিপশন যাচাই ও ভেরিফাইড হিসেবে অনুমোদিত হয়েছে।",
        link: `/requests/${requestId}`,
        isRead: false,
      });
    } else {
      await Notification.create({
        recipientId: requesterId,
        category: "SYSTEM",
        titleEn: "Request Canceled / Rejected",
        titleBn: "আবেদন বাতিল করা হয়েছে",
        messageEn: `Your emergency request was rejected by a coordinator. Reason: ${rejectReason || "Invalid verification document"}.`,
        messageBn: `আপনার আবেদনটি বাতিল করা হয়েছে। কারণ: ${rejectReason || "প্রেসক্রিপশন অস্পষ্ট বা ভেরিফাই করা যায়নি"}।`,
        link: `/requests/${requestId}`,
        isRead: false,
      });
    }
  } catch (err) {
    console.error("Verification dispatch error:", err);
  }
}
