/**
 * BLOOD&LIFE Transactional Email Templates
 * Responsive, inline-styled, UTF-8 encoded, bilingual (Bengali & English), with plain-text fallbacks.
 */

function sanitizeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const EMAIL_FOOTER_HTML = `
  <div style="border-top: 1px solid #e2e8f0; margin-top: 24px; padding-top: 16px; text-align: center; color: #64748b; font-size: 12px; line-height: 1.5;">
    <p style="margin: 0 0 6px 0; font-weight: 600; color: #475569;">BLOOD&LIFE (ব্লাড অ্যান্ড লাইফ) • ন্যাশনাল ইমার্জেন্সি ব্লাড ডিসপ্যাচ নেটওয়ার্ক</p>
    <p style="margin: 0 0 6px 0;">একটি সম্পূর্ণ অলাভজনক ও উন্মুক্ত জীবনরক্ষাকারী সেবা। রক্তের জন্য কোনো আর্থিক লেনদেন করবেন না।</p>
    <p style="margin: 0; font-size: 11px; color: #94a3b8;">© ${new Date().getFullYear()} BLOOD&LIFE. All rights reserved.</p>
  </div>
`;

const EMAIL_FOOTER_TEXT = `
---
BLOOD&LIFE (ব্লাড অ্যান্ড লাইফ) • ন্যাশনাল ইমার্জেন্সি ব্লাড ডিসপ্যাচ নেটওয়ার্ক
একটি সম্পূর্ণ অলাভজনক ও উন্মুক্ত জীবনরক্ষাকারী সেবা। রক্তের জন্য কোনো আর্থিক লেনদেন করবেন না।
© ${new Date().getFullYear()} BLOOD&LIFE. All rights reserved.
`;

/**
 * 1. Email Verification Template (Supports 6-Digit OTP Code & Dual 1-Click Link)
 */
export function buildVerificationEmailTemplate({
  name,
  code,
  verificationUrl,
}: {
  name: string;
  code?: string;
  verificationUrl: string;
}): { html: string; text: string } {
  const safeName = sanitizeHtml(name);
  const displayCode = code ? sanitizeHtml(code) : "";

  const html = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ইমেইল ভেরিফিকেশন কোড — BLOOD&LIFE</title>
</head>
<body style="margin: 0; padding: 20px 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);" border="0" cellspacing="0" cellpadding="0">
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 26px 24px; text-align: center; color: #ffffff;">
              <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px;">BLOOD&LIFE (ব্লাড অ্যান্ড লাইফ)</h1>
              <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.95;">অ্যাকাউন্ট ভেরিফিকেশন কোড • Verification Code</p>
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding: 28px 24px; color: #0f172a;">
              <p style="font-size: 15px; margin-top: 0; line-height: 1.5;">প্রিয় <strong>${safeName}</strong>,</p>
              <p style="font-size: 14px; line-height: 1.6; color: #334155;">
                BLOOD&LIFE ইমার্জেন্সি ব্লাড নেটওয়ার্কে নিবন্ধিত হওয়ার জন্য ধন্যবাদ। আপনার অ্যাকাউন্টটি সক্রিয় করতে নিচের ৬-সংখ্যার ভেরিফিকেশন কোডটি ব্যবহার করুন:
              </p>

              ${
                displayCode
                  ? `<!-- OTP Card -->
              <div style="background: #fff1f2; border: 2px dashed #f43f5e; border-radius: 12px; padding: 20px 16px; text-align: center; margin: 24px 0;">
                <span style="font-size: 12px; font-weight: 700; color: #be123c; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 8px;">
                  আপনার ভেরিফিকেশন কোড (Verification Code)
                </span>
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #be123c; display: inline-block; padding-left: 10px;">
                  ${displayCode}
                </span>
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #9f1239; font-weight: 600;">
                  ⏱️ এই কোডটির মেয়াদ <strong>১৫ মিনিট</strong> (Valid for 15 minutes)
                </p>
              </div>`
                  : ""
              }

              <div style="text-align: center; margin: 24px 0 16px 0;">
                <a href="${verificationUrl}" style="background: #dc2626; color: #ffffff; padding: 13px 32px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px; display: inline-block; box-shadow: 0 2px 4px rgba(220, 38, 38, 0.25);">
                  এক ক্লিকে ভেরিফাই করুন (1-Click Verify)
                </a>
              </div>

              <div style="background: #f8fafc; border-left: 4px solid #dc2626; padding: 12px 16px; border-radius: 6px; margin: 20px 0; font-size: 13px; color: #475569;">
                <p style="margin: 0 0 4px 0;"><strong>💡 পরামর্শ:</strong> আপনি ব্রাউজারে কোডটি টাইপ করতে পারেন অথবা সরাসরি উপরের বাটনে ক্লিক করতে পারেন।</p>
                <p style="margin: 0; font-size: 12px; color: #64748b;">বাটনটি কাজ না করলে এই লিঙ্কটি ব্রাউজারে কপি-পেস্ট করুন:<br><a href="${verificationUrl}" style="color: #dc2626; word-break: break-all;">${verificationUrl}</a></p>
              </div>
              <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin-bottom: 0;">
                আপনি যদি এই অ্যাকাউন্টটি না খুলে থাকেন, তবে দয়া করে এই ইমেইলটি উপেক্ষা করুন। রক্তের জন্য কখনো আর্থিক লেনদেন করবেন না।
              </p>
              ${EMAIL_FOOTER_HTML}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `
BLOOD&LIFE (ব্লাড অ্যান্ড লাইফ)
অ্যাকাউন্ট ভেরিফিকেশন কোড • Verification Code

প্রিয় ${name},

BLOOD&LIFE ইমার্জেন্সি ব্লাড নেটওয়ার্কে নিবন্ধিত হওয়ার জন্য ধন্যবাদ।
${displayCode ? `\nআপনার ৬-সংখ্যার ভেরিফিকেশন কোড: ${displayCode}\n(মেয়াদ: ১৫ মিনিট)\n` : ""}
আপনার অ্যাকাউন্ট সক্রিয় করতে কোডটি ইনপুট করুন অথবা নিচের লিঙ্কে যান:
${verificationUrl}

আপনি যদি এই অ্যাকাউন্টটি না খুলে থাকেন, তবে দয়া করে এই ইমেইলটি উপেক্ষা করুন।

${EMAIL_FOOTER_TEXT}
  `.trim();

  return { html, text };
}

/**
 * 2. Password Reset Template
 */
export function buildPasswordResetEmailTemplate({
  name,
  resetUrl,
}: {
  name: string;
  resetUrl: string;
}): { html: string; text: string } {
  const safeName = sanitizeHtml(name);

  const html = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>পাসওয়ার্ড রিসেট — BLOOD&LIFE</title>
</head>
<body style="margin: 0; padding: 20px 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 24px; text-align: center; color: #ffffff;">
              <h1 style="margin: 0; font-size: 22px; font-weight: 800;">BLOOD&LIFE (ব্লাড অ্যান্ড লাইফ)</h1>
              <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.95;">অ্যাকাউন্ট নিরাপত্তা ও পাসওয়ার্ড রিসেট</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 28px 24px; color: #0f172a;">
              <p style="font-size: 15px; margin-top: 0; line-height: 1.5;">প্রিয় <strong>${safeName}</strong>,</p>
              <p style="font-size: 14px; line-height: 1.6; color: #334155;">
                আপনার BLOOD&LIFE অ্যাকাউন্টের পাসওয়ার্ড রিসেট করার আবেদন গৃহীত হয়েছে। নিচের বাটনে ক্লিক করে আগামী ৩০ মিনিটের মধ্যে নতুন পাসওয়ার্ড সেট করুন:
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background: #dc2626; color: #ffffff; padding: 13px 32px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px; display: inline-block; box-shadow: 0 2px 4px rgba(220, 38, 38, 0.25);">
                  পাসওয়ার্ড রিসেট করুন (Reset Password)
                </a>
              </div>
              <div style="background: #f8fafc; border-left: 4px solid #dc2626; padding: 12px 16px; border-radius: 6px; margin: 20px 0; font-size: 13px; color: #475569;">
                <p style="margin: 0 0 4px 0;"><strong>⚠️ নিরাপত্তা সতর্কতা:</strong> এই লিঙ্কটি মাত্র <strong>৩০ মিনিটের</strong> জন্য কার্যকর এবং একবার ব্যবহারের পর বাতিল হয়ে যাবে।</p>
                <p style="margin: 0; font-size: 12px; color: #64748b;">বাটন কাজ না করলে এই লিঙ্কটি ব্যবহার করুন:<br><a href="${resetUrl}" style="color: #dc2626; word-break: break-all;">${resetUrl}</a></p>
              </div>
              <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin-bottom: 0;">
                আপনি যদি এই আবেদন না করে থাকেন, তবে কোনো ব্যবস্থা নেওয়ার প্রয়োজন নেই। আপনার অ্যাকাউন্টের পাসওয়ার্ড সুরক্ষিত রয়েছে।
              </p>
              ${EMAIL_FOOTER_HTML}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `
BLOOD&LIFE (ব্লাড অ্যান্ড লাইফ)
পাসওয়ার্ড রিসেট • Password Reset

প্রিয় ${name},

আপনার BLOOD&LIFE অ্যাকাউন্টের পাসওয়ার্ড রিসেট করার আবেদন গৃহীত হয়েছে।
নতুন পাসওয়ার্ড সেট করতে নিচের লিঙ্কে ক্লিক করুন (আগামী ৩০ মিনিট কার্যকর):

${resetUrl}

নিরাপত্তা সতর্কতা: আপনি যদি এই আবেদন না করে থাকেন, তবে কোনো ব্যবস্থা নেওয়ার প্রয়োজন নেই।

${EMAIL_FOOTER_TEXT}
  `.trim();

  return { html, text };
}

/**
 * 3. Password Change Security Alert Template
 */
export function buildPasswordChangeAlertEmailTemplate({
  name,
  timestamp,
  ip,
}: {
  name: string;
  timestamp: string;
  ip: string;
}): { html: string; text: string } {
  const safeName = sanitizeHtml(name);

  const html = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>নিরাপত্তা সতর্কতা — BLOOD&LIFE</title>
</head>
<body style="margin: 0; padding: 20px 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td style="background: #1e293b; padding: 24px; text-align: center; color: #ffffff;">
              <h1 style="margin: 0; font-size: 20px; font-weight: 800; color: #f87171;">🚨 নিরাপত্তা সতর্কতা • Security Notice</h1>
              <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.9;">আপনার পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 28px 24px; color: #0f172a;">
              <p style="font-size: 15px; margin-top: 0; line-height: 1.5;">প্রিয় <strong>${safeName}</strong>,</p>
              <p style="font-size: 14px; line-height: 1.6; color: #334155;">
                আপনার BLOOD&LIFE অ্যাকাউন্টের পাসওয়ার্ড সম্প্রতি পরিবর্তন করা হয়েছে। সুরক্ষার স্বার্থে পূর্বের সকল অ্যাক্টিভ লগইন সেশন বাতিল (revoke) করা হয়েছে।
              </p>
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 14px 18px; border-radius: 8px; margin: 20px 0; font-size: 13px; color: #334155;">
                <p style="margin: 4px 0;"><strong>তারিখ ও সময়:</strong> ${timestamp}</p>
                <p style="margin: 4px 0;"><strong>আইপি অ্যাড্রেস:</strong> ${ip}</p>
              </div>
              <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 14px 16px; border-radius: 6px; margin: 20px 0; font-size: 13px; color: #991b1b;">
                <strong>⚠️ আপনি কি এই পরিবর্তনটি করেননি?</strong><br>
                যদি আপনি নিজে এই পরিবর্তন না করে থাকেন, তবে অবিলম্বে আমাদের সাপোর্ট টিমে যোগাযোগ করুন অথবা পুনরায় পাসওয়ার্ড রিসেট করে অ্যাকাউন্ট সুরক্ষিত করুন।
              </div>
              ${EMAIL_FOOTER_HTML}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `
নিরাপত্তা সতর্কতা • Security Notice
BLOOD&LIFE (ব্লাড অ্যান্ড লাইফ)

প্রিয় ${name},

আপনার BLOOD&LIFE অ্যাকাউন্টের পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে।
তারিখ ও সময়: ${timestamp}
আইপি অ্যাড্রেস: ${ip}

পূর্বের সকল লগইন সেশন বাতিল করা হয়েছে। যদি আপনি এই পরিবর্তন না করে থাকেন, তবে অবিলম্বে অ্যাকাউন্ট পুনরুদ্ধার করুন।

${EMAIL_FOOTER_TEXT}
  `.trim();

  return { html, text };
}

/**
 * 4. Welcome Email Template
 */
export function buildWelcomeEmailTemplate({
  name,
  bloodGroup,
  dashboardUrl,
}: {
  name: string;
  bloodGroup: string;
  dashboardUrl: string;
}): { html: string; text: string } {
  const safeName = sanitizeHtml(name);
  const safeBlood = sanitizeHtml(bloodGroup);

  const html = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>স্বাগতম — BLOOD&LIFE</title>
</head>
<body style="margin: 0; padding: 20px 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 28px 24px; text-align: center; color: #ffffff;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 800;">স্বাগতম BLOOD&LIFE-এ! 🩸</h1>
              <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.95;">জীবনরক্ষাকারী জাতীয় নেটওয়ার্কে আপনাকে স্বাগতম</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 28px 24px; color: #0f172a;">
              <p style="font-size: 15px; margin-top: 0; line-height: 1.5;">প্রিয় <strong>${safeName}</strong>,</p>
              <p style="font-size: 14px; line-height: 1.6; color: #334155;">
                আপনার ইমেইল ভেরিফিকেশন সফল হয়েছে। BLOOD&LIFE প্ল্যাটফর্মে আপনার রক্তদাতা প্রোফাইল সক্রিয় করা হয়েছে:
              </p>
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px 20px; margin: 20px 0; text-align: center;">
                <span style="display: inline-block; background: #dc2626; color: #ffffff; font-weight: 900; font-size: 18px; padding: 6px 18px; border-radius: 8px; margin-bottom: 8px;">
                  রক্তের গ্রুপ: ${safeBlood}
                </span>
                <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b;">
                  আপনার এলাকায় যখনই জরুরি রক্তের প্রয়োজন হবে, আপনি তাৎক্ষণিক নোটিফিকেশন পাবেন।
                </p>
              </div>
              <div style="text-align: center; margin: 28px 0;">
                <a href="${dashboardUrl}" style="background: #dc2626; color: #ffffff; padding: 13px 32px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px; display: inline-block; box-shadow: 0 2px 4px rgba(220, 38, 38, 0.25);">
                  ড্যাশবোর্ডে প্রবেশ করুন (Open Dashboard)
                </a>
              </div>
              ${EMAIL_FOOTER_HTML}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `
স্বাগতম BLOOD&LIFE-এ!
জীবনরক্ষাকারী জাতীয় নেটওয়ার্কে আপনাকে স্বাগতম।

প্রিয় ${name},

আপনার ইমেইল ভেরিফিকেশন সফল হয়েছে। আপনার রক্তের গ্রুপ: ${bloodGroup}
আপনার এলাকায় যখনই জরুরি রক্তের প্রয়োজন হবে, আপনি তাৎক্ষণিক নোটিফিকেশন পাবেন।

ড্যাশবোর্ডে প্রবেশ করুন:
${dashboardUrl}

${EMAIL_FOOTER_TEXT}
  `.trim();

  return { html, text };
}

/**
 * 5. Targeted Urgent Blood Match Email Template (With Full Clinical & Contact Context)
 */
export function buildUrgentMatchEmailTemplate({
  donorName,
  patientName,
  bloodGroup,
  unitsNeeded = 1,
  bloodComponent = "whole_blood",
  urgency = "urgent",
  hospital,
  upazila,
  district,
  division,
  scheduledDate,
  scheduledTime,
  medicalReason,
  message,
  requesterName,
  requesterPhone,
  isVerifiedGenuine = false,
  caseId,
  matchTierLabel,
  settingsUrl,
}: {
  donorName: string;
  patientName: string;
  bloodGroup: string;
  unitsNeeded?: number;
  bloodComponent?: string;
  urgency?: string;
  hospital: string;
  upazila?: string;
  district: string;
  division?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  medicalReason?: string;
  message?: string;
  requesterName?: string;
  requesterPhone?: string;
  isVerifiedGenuine?: boolean;
  caseId: string;
  matchTierLabel?: string;
  settingsUrl?: string;
}): { html: string; text: string } {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
  const caseUrl = `${appUrl}/requests/${encodeURIComponent(caseId)}`;
  const prefsUrl = settingsUrl || `${appUrl}/dashboard/settings`;

  const safeDonor = sanitizeHtml(donorName || "সম্মানিত রক্তদাতা");
  const safePatient = sanitizeHtml(patientName || "জরুরি রোগী");
  const safeBlood = sanitizeHtml(bloodGroup);
  const safeHospital = sanitizeHtml(hospital);
  const locationLine = [upazila, district, division]
    .filter((v): v is string => Boolean(v))
    .map(sanitizeHtml)
    .join(", ");
  const safeReason = medicalReason ? sanitizeHtml(medicalReason) : "";
  const safeMessage = message ? sanitizeHtml(message) : "";
  const safeRequester = requesterName ? sanitizeHtml(requesterName) : "";
  const safePhone = requesterPhone ? sanitizeHtml(requesterPhone) : "";
  const safeTierLabel = matchTierLabel
    ? sanitizeHtml(matchTierLabel)
    : `রক্তের গ্রুপ (${safeBlood}) ও এলাকা (${sanitizeHtml(district)}) ম্যাচ`;

  const componentLabelMap: Record<string, string> = {
    whole_blood: "Whole Blood (হোল ব্লাড)",
    prbc: "PRBC / Red Cells (লোহিত রক্তকণিকা)",
    platelets: "Platelets / SDP-RDP (প্লাটিলেট)",
    plasma: "Plasma / FFP (প্লাজমা)",
  };
  const componentLabel = componentLabelMap[bloodComponent] || sanitizeHtml(bloodComponent);

  const urgencyBadge =
    urgency === "critical"
      ? { bg: "#991b1b", label: "🚨 CRITICAL • আশঙ্কাজনক জরুরি" }
      : urgency === "urgent"
      ? { bg: "#dc2626", label: "⚡ URGENT • অতি জরুরি" }
      : { bg: "#2563eb", label: "📅 SCHEDULED • নির্ধারিত সময়" };

  const verificationText = isVerifiedGenuine
    ? "✅ ভলান্টিয়ার কর্তৃক যাচাইকৃত (Verified Genuine)"
    : "⏳ নতুন জরুরি আবেদন (যাচাই চলমান)";

  const scheduleInfo =
    scheduledDate || scheduledTime
      ? sanitizeHtml([scheduledDate, scheduledTime].filter(Boolean).join(" • "))
      : "যত দ্রুত সম্ভব (Immediate)";

  const html = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>জরুরি ${safeBlood} রক্তের আবেদন — BLOOD&LIFE</title>
</head>
<body style="margin: 0; padding: 20px 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td style="background: linear-gradient(135deg, ${urgencyBadge.bg} 0%, #7f1d1d 100%); padding: 24px; text-align: center; color: #ffffff;">
              <span style="display: inline-block; background: rgba(255,255,255,0.18); padding: 4px 12px; border-radius: 999px; font-size: 11px; font-weight: 800; letter-spacing: 0.5px; margin-bottom: 8px;">
                ${urgencyBadge.label}
              </span>
              <h1 style="margin: 0; font-size: 22px; font-weight: 800;">BLOOD&LIFE — জরুরি ${safeBlood} রক্তের আহ্বান</h1>
              <p style="margin: 6px 0 0 0; font-size: 12px; opacity: 0.92;">🎯 ${safeTierLabel}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 26px 24px; color: #0f172a;">
              <p style="font-size: 15px; margin-top: 0;">প্রিয় <strong>${safeDonor}</strong>,</p>
              <p style="font-size: 14px; line-height: 1.6; color: #334155;">
                আপনার প্রোফাইল তথ্য অনুযায়ী <strong>${locationLine}</strong> এলাকায় চিকিৎসাধীন রোগী <strong>${safePatient}</strong>-এর জন্য জরুরি ভিত্তিতে <strong>${unitsNeeded} ব্যাগ ${safeBlood}</strong> রক্তের প্রয়োজন হয়েছে।
              </p>

              <div style="background: #fff1f2; border-left: 4px solid #dc2626; padding: 16px 18px; border-radius: 8px; margin: 20px 0; font-size: 13px; color: #1e293b; line-height: 1.7;">
                <p style="margin: 2px 0;"><strong>🩸 রক্তের গ্রুপ ও পরিমাণ:</strong> <span style="color: #dc2626; font-weight: 900; font-size: 15px;">${safeBlood}</span> (${unitsNeeded} ব্যাগ • ${componentLabel})</p>
                <p style="margin: 2px 0;"><strong>🏥 হাসপাতাল:</strong> ${safeHospital}</p>
                <p style="margin: 2px 0;"><strong>📍 এলাকা:</strong> ${locationLine}</p>
                <p style="margin: 2px 0;"><strong>⏰ রক্তদানের সময়:</strong> ${scheduleInfo}</p>
                ${safeReason ? `<p style="margin: 2px 0;"><strong>🩺 রোগীর অবস্থা / কারণ:</strong> ${safeReason}</p>` : ""}
                <p style="margin: 2px 0;"><strong>🛡️ যাচাই অবস্থা:</strong> ${verificationText}</p>
                ${safeRequester || safePhone ? `<p style="margin: 6px 0 0 0; padding-top: 6px; border-top: 1px dashed #fecdd3;"><strong>📞 যোগাযোগ:</strong> ${safeRequester}${safeRequester && safePhone ? " • " : ""}${safePhone ? `<a href="tel:${safePhone}" style="color: #dc2626; font-weight: 800; text-decoration: none;">${safePhone}</a>` : ""}</p>` : ""}
              </div>

              ${safeMessage ? `<p style="font-size: 13px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px 14px; border-radius: 8px; color: #475569; font-style: italic;">"${safeMessage}"</p>` : ""}

              <p style="font-size: 13px; line-height: 1.6; color: #475569;">
                আপনি যদি বর্তমানে শারীরিকভাবে সুস্থ থাকেন এবং গত ৯০ দিনে রক্তদান না করে থাকেন, তবে অনুগ্রহ করে নিচের বাটনে ক্লিক করে রক্তদানের অঙ্গীকার (Pledge) করুন অথবা সরাসরি রোগীর স্বজনের সাথে যোগাযোগ করুন।
              </p>

              <div style="text-align: center; margin: 26px 0;">
                <a href="${caseUrl}" style="background: #dc2626; color: #ffffff; padding: 13px 30px; text-decoration: none; border-radius: 10px; font-weight: 800; font-size: 14px; display: inline-block; box-shadow: 0 2px 6px rgba(220, 38, 38, 0.3);">
                  কেস বিস্তারিত দেখুন ও রক্ত দিন (View &amp; Pledge)
                </a>
              </div>

              <p style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 16px;">
                ইমেইল অ্যালার্ট পছন্দ না করলে আপনার <a href="${prefsUrl}" style="color: #64748b;">প্রোফাইল সেটিংস</a> থেকে নোটিফিকেশন বন্ধ করতে পারেন।
              </p>
              ${EMAIL_FOOTER_HTML}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `
BLOOD&LIFE — জরুরি ${bloodGroup} রক্তের আবেদন (${urgencyBadge.label})
ম্যাচ ধরন: ${matchTierLabel || `${bloodGroup} • ${district}`}

প্রিয় ${donorName || "সম্মানিত রক্তদাতা"},
${locationLine} এলাকায় রোগী ${patientName}-এর জন্য ${unitsNeeded} ব্যাগ ${bloodGroup} (${componentLabel}) রক্তের জরুরি প্রয়োজন।

হাসপাতাল: ${hospital}
এলাকা: ${locationLine}
সময়: ${scheduleInfo}
${medicalReason ? `কারণ: ${medicalReason}\n` : ""}যাচাই অবস্থা: ${verificationText}
${requesterName || requesterPhone ? `যোগাযোগ: ${requesterName || ""} ${requesterPhone || ""}\n` : ""}
${message ? `বার্তা: "${message}"\n` : ""}
কেস বিস্তারিত দেখুন ও অঙ্গীকার করুন: ${caseUrl}
সেটিংস পরিবর্তন: ${prefsUrl}

${EMAIL_FOOTER_TEXT}
  `.trim();

  return { html, text };
}

/**
 * 6. Donor Pledge Confirmation Email to Patient Requester
 */
export function buildPledgeAlertEmailTemplate({
  requesterName,
  patientName,
  donorName,
  donorBloodGroup,
  donorPhone,
  hospital,
  caseId,
}: {
  requesterName: string;
  patientName: string;
  donorName: string;
  donorBloodGroup: string;
  donorPhone?: string;
  hospital: string;
  caseId: string;
}): { html: string; text: string } {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
  const caseUrl = `${appUrl}/requests/${encodeURIComponent(caseId)}`;
  const safeRequester = sanitizeHtml(requesterName || "সম্মানিত আবেদনকারী");
  const safePatient = sanitizeHtml(patientName);
  const safeDonor = sanitizeHtml(donorName);
  const safeBlood = sanitizeHtml(donorBloodGroup);
  const safePhone = donorPhone ? sanitizeHtml(donorPhone) : "";
  const safeHospital = sanitizeHtml(hospital);

  const html = `<!DOCTYPE html>
<html lang="bn">
<head><meta charset="UTF-8"><title>রক্তদাতা পাওয়া গেছে — BLOOD&LIFE</title></head>
<body style="margin: 0; padding: 20px 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
  <table role="presentation" width="100%" style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #e2e8f0;" border="0" cellspacing="0" cellpadding="0">
    <tr><td style="background: #059669; padding: 22px; text-align: center; color: #ffffff;">
      <h1 style="margin: 0; font-size: 20px; font-weight: 800;">🩸 সুখবর! রক্তদাতা পাওয়া গেছে</h1>
    </td></tr>
    <tr><td style="padding: 24px; color: #0f172a; font-size: 14px; line-height: 1.6;">
      <p style="margin-top: 0;">প্রিয় <strong>${safeRequester}</strong>,</p>
      <p><strong>${safeHospital}</strong>-এ চিকিৎসাধীন রোগী <strong>${safePatient}</strong>-এর জন্য স্বেচ্ছাসেবী রক্তদাতা <strong>${safeDonor} (${safeBlood})</strong> রক্তদানের অঙ্গীকার (Pledge) করেছেন।</p>
      ${safePhone ? `<p style="background: #ecfdf5; border: 1px solid #a7f3d0; padding: 12px; border-radius: 8px;"><strong>📞 রক্তদাতার ফোন নম্বর:</strong> <a href="tel:${safePhone}" style="color: #047857; font-weight: 800;">${safePhone}</a></p>` : ""}
      <div style="text-align: center; margin: 22px 0;">
        <a href="${caseUrl}" style="background: #059669; color: #ffffff; padding: 12px 26px; text-decoration: none; border-radius: 10px; font-weight: 700;">আবেদন ও ডোনার বিস্তারিত দেখুন</a>
      </div>
      <p style="font-size: 12px; color: #64748b;">⚠️ সতর্কতা: কোনো অবস্থাতেই রক্তের জন্য কাউকে বিকাশ/নগদে অগ্রিম টাকা পাঠাবেন না।</p>
      ${EMAIL_FOOTER_HTML}
    </td></tr>
  </table>
</body>
</html>`;

  const text = `সুখবর! ${donorName} (${donorBloodGroup}) রোগী ${patientName}-এর জন্য (${hospital}) রক্তদানের অঙ্গীকার করেছেন। ${donorPhone ? `ফোন: ${donorPhone}` : ""}\nবিস্তারিত: ${caseUrl}\n${EMAIL_FOOTER_TEXT}`.trim();
  return { html, text };
}

/**
 * 7. Request Verification / Rejection Email to Requester
 */
export function buildRequestVerificationEmailTemplate({
  requesterName,
  patientName,
  hospital,
  action,
  rejectReason,
  caseId,
}: {
  requesterName: string;
  patientName: string;
  hospital: string;
  action: "VERIFY" | "REJECT";
  rejectReason?: string;
  caseId: string;
}): { html: string; text: string } {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
  const caseUrl = `${appUrl}/requests/${encodeURIComponent(caseId)}`;
  const isVerified = action === "VERIFY";
  const safeRequester = sanitizeHtml(requesterName || "সম্মানিত আবেদনকারী");
  const safePatient = sanitizeHtml(patientName);
  const safeHospital = sanitizeHtml(hospital);
  const safeReason = rejectReason ? sanitizeHtml(rejectReason) : "অসম্পূর্ণ বা অস্পষ্ট প্রেসক্রিপশন";

  const html = `<!DOCTYPE html>
<html lang="bn">
<head><meta charset="UTF-8"><title>আবেদন আপডেট — BLOOD&LIFE</title></head>
<body style="margin: 0; padding: 20px 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
  <table role="presentation" width="100%" style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #e2e8f0;" border="0" cellspacing="0" cellpadding="0">
    <tr><td style="background: ${isVerified ? "#2563eb" : "#dc2626"}; padding: 22px; text-align: center; color: #ffffff;">
      <h1 style="margin: 0; font-size: 20px; font-weight: 800;">${isVerified ? "✅ আবেদন ভেরিফাইড হয়েছে" : "❌ আবেদন বাতিল করা হয়েছে"}</h1>
    </td></tr>
    <tr><td style="padding: 24px; color: #0f172a; font-size: 14px; line-height: 1.6;">
      <p style="margin-top: 0;">প্রিয় <strong>${safeRequester}</strong>,</p>
      <p>${isVerified
        ? `<strong>${safeHospital}</strong>-এ রোগী <strong>${safePatient}</strong>-এর জন্য আপনার রক্তের আবেদনটি আমাদের ভলান্টিয়ার টিম কর্তৃক যাচাই ও ভেরিফাইড (Verified Genuine) হিসেবে অনুমোদিত হয়েছে।`
        : `<strong>${safeHospital}</strong>-এ রোগী <strong>${safePatient}</strong>-এর জন্য আপনার আবেদনটি যাচাই প্রক্রিয়ায় বাতিল করা হয়েছে। কারণ: <strong>${safeReason}</strong>।`}</p>
      <div style="text-align: center; margin: 22px 0;">
        <a href="${caseUrl}" style="background: ${isVerified ? "#2563eb" : "#475569"}; color: #ffffff; padding: 12px 26px; text-decoration: none; border-radius: 10px; font-weight: 700;">বিস্তারিত দেখুন</a>
      </div>
      ${EMAIL_FOOTER_HTML}
    </td></tr>
  </table>
</body>
</html>`;

  const text = `${isVerified ? "আবেদন ভেরিফাইড" : "আবেদন বাতিল"} — রোগী: ${patientName}, হাসপাতাল: ${hospital}${!isVerified ? `, কারণ: ${rejectReason || ""}` : ""}\nলিংক: ${caseUrl}\n${EMAIL_FOOTER_TEXT}`.trim();
  return { html, text };
}

/**
 * 8. Recipient Donation Recognition & Certificate Email to Donor
 */
export function buildDonationVerifiedEmailTemplate({
  donorName,
  patientName,
  hospital,
  bloodGroup,
  rating,
  certificateId,
}: {
  donorName: string;
  patientName: string;
  hospital: string;
  bloodGroup: string;
  rating: number;
  certificateId: string;
}): { html: string; text: string } {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
  const certUrl = `${appUrl}/verify-cert/${encodeURIComponent(certificateId)}`;
  const safeDonor = sanitizeHtml(donorName || "সম্মানিত রক্তদাতা");
  const safePatient = sanitizeHtml(patientName);
  const safeHospital = sanitizeHtml(hospital);
  const safeBlood = sanitizeHtml(bloodGroup);
  const safeCert = sanitizeHtml(certificateId);

  const html = `<!DOCTYPE html>
<html lang="bn">
<head><meta charset="UTF-8"><title>ভেরিফাইড রক্তদান সনদ — BLOOD&LIFE</title></head>
<body style="margin: 0; padding: 20px 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
  <table role="presentation" width="100%" style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #e2e8f0;" border="0" cellspacing="0" cellpadding="0">
    <tr><td style="background: linear-gradient(135deg, #d97706 0%, #b45309 100%); padding: 24px; text-align: center; color: #ffffff;">
      <h1 style="margin: 0; font-size: 20px; font-weight: 800;">🏆 আপনার রক্তদান ভেরিফাইড হয়েছে!</h1>
    </td></tr>
    <tr><td style="padding: 24px; color: #0f172a; font-size: 14px; line-height: 1.6;">
      <p style="margin-top: 0;">প্রিয় <strong>${safeDonor}</strong>,</p>
      <p><strong>${safeHospital}</strong>-এ রোগী <strong>${safePatient}</strong>-এর জন্য আপনার মহৎ <strong>${safeBlood}</strong> রক্তদান রোগীর পরিবার কর্তৃক কৃতজ্ঞতার সাথে ভেরিফাই করা হয়েছে এবং আপনাকে <strong>${rating}★ ট্রাস্ট রেটিং</strong> দেওয়া হয়েছে।</p>
      <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 14px; text-align: center; margin: 18px 0;">
        <span style="font-size: 11px; color: #92400e; font-weight: 700; display: block;">অফিসিয়াল সনদপত্র আইডি</span>
        <span style="font-family: monospace; font-size: 16px; font-weight: 900; color: #b45309;">${safeCert}</span>
      </div>
      <div style="text-align: center; margin: 22px 0;">
        <a href="${certUrl}" style="background: #d97706; color: #ffffff; padding: 12px 26px; text-decoration: none; border-radius: 10px; font-weight: 700;">সার্টিফিকেট দেখুন (Verify Certificate)</a>
      </div>
      ${EMAIL_FOOTER_HTML}
    </td></tr>
  </table>
</body>
</html>`;

  const text = `অভিনন্দন ${donorName}! ${hospital}-এ ${patientName}-এর জন্য আপনার ${bloodGroup} রক্তদান ভেরিফাইড হয়েছে (${rating}★)। সার্টিফিকেট: ${certUrl}\n${EMAIL_FOOTER_TEXT}`.trim();
  return { html, text };
}
