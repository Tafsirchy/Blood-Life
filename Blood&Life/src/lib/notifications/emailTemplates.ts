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
 * 1. Email Verification Template
 */
export function buildVerificationEmailTemplate({
  name,
  verificationUrl,
}: {
  name: string;
  verificationUrl: string;
}): { html: string; text: string } {
  const safeName = sanitizeHtml(name);

  const html = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ইমেইল ভেরিফিকেশন — BLOOD&LIFE</title>
</head>
<body style="margin: 0; padding: 20px 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);" border="0" cellspacing="0" cellpadding="0">
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 24px; text-align: center; color: #ffffff;">
              <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px;">BLOOD&LIFE (ব্লাড অ্যান্ড লাইফ)</h1>
              <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.95;">অ্যাকাউন্ট নিশ্চিতকরণ • Email Verification</p>
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding: 28px 24px; color: #0f172a;">
              <p style="font-size: 15px; margin-top: 0; line-height: 1.5;">প্রিয় <strong>${safeName}</strong>,</p>
              <p style="font-size: 14px; line-height: 1.6; color: #334155;">
                BLOOD&LIFE ইমার্জেন্সি ব্লাড নেটওয়ার্কে নিবন্ধিত হওয়ার জন্য ধন্যবাদ। আপনার অ্যাকাউন্টটি সক্রিয় করতে এবং জীবনরক্ষাকারী ডিসপ্যাচ নেটওয়ার্কে যোগ দিতে নিচের বাটনে ক্লিক করুন:
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" style="background: #dc2626; color: #ffffff; padding: 13px 32px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px; display: inline-block; box-shadow: 0 2px 4px rgba(220, 38, 38, 0.25);">
                  ইমেইল ভেরিফাই করুন (Verify Email)
                </a>
              </div>
              <div style="background: #f8fafc; border-left: 4px solid #dc2626; padding: 12px 16px; border-radius: 6px; margin: 20px 0; font-size: 13px; color: #475569;">
                <p style="margin: 0 0 4px 0;"><strong>⚠️ মেয়াদ:</strong> এই ভেরিফিকেশন লিঙ্কটি আগামী <strong>২৪ ঘণ্টার</strong> জন্য কার্যকর থাকবে।</p>
                <p style="margin: 0; font-size: 12px; color: #64748b;">বাটনটি কাজ না করলে এই লিঙ্কটি ব্রাউজারে কপি-পেস্ট করুন:<br><a href="${verificationUrl}" style="color: #dc2626; word-break: break-all;">${verificationUrl}</a></p>
              </div>
              <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin-bottom: 0;">
                আপনি যদি এই অ্যাকাউন্টটি না খুলে থাকেন, তবে দয়া করে এই ইমেইলটি উপেক্ষা করুন।
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
অ্যাকাউন্ট নিশ্চিতকরণ • Email Verification

প্রিয় ${name},

BLOOD&LIFE ইমার্জেন্সি ব্লাড নেটওয়ার্কে নিবন্ধিত হওয়ার জন্য ধন্যবাদ।
আপনার অ্যাকাউন্টটি সক্রিয় করতে নিচের লিঙ্কে ক্লিক করুন (আগামী ২৪ ঘণ্টা কার্যকর):

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
