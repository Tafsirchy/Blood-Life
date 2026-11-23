/**
 * Free-Tier Resend API transactional email sender
 * Delivers instant notification emails to donors, requesters, and volunteers.
 */

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export async function sendTransactionalEmail({ to, subject, html, text, replyTo }: SendEmailParams) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.EMAIL_FROM || "BLOOD&LIFE Emergency <onboarding@resend.dev>";

  const recipients = Array.isArray(to) ? to : [to];
  const plainText = text || html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

  // Always log dispatch subject in non-production for local testing & observability
  if (process.env.NODE_ENV !== "production") {
    console.info(`[Email Dispatch] To: ${recipients.join(", ")} | Subject: ${subject}`);
  }

  if (!apiKey) {
    return { success: true, mocked: true };
  }

  try {
    const payload: Record<string, any> = {
      from: fromAddress,
      to: recipients,
      subject,
      html,
      text: plainText,
    };

    if (replyTo) {
      payload.reply_to = replyTo;
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Resend API delivery failed:", err);
      return { success: false, error: err };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (err: any) {
    console.error("Resend fetch exception:", err);
    return { success: false, error: err.message };
  }
}

export const sendEmail = sendTransactionalEmail;

/**
 * High-Conversion Emergency Match Email Template
 */
export function buildUrgentMatchEmailTemplate({
  donorName,
  patientName,
  bloodGroup,
  hospital,
  district,
  caseId,
}: {
  donorName: string;
  patientName: string;
  bloodGroup: string;
  hospital: string;
  district: string;
  caseId: string;
}) {
  return `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
    <div style="background: #dc2626; color: #ffffff; padding: 20px; text-align: center;">
      <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px;">BLOOD&LIFE (ব্লাড অ্যান্ড লাইফ)</h1>
      <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">জরুরী রক্তদানের আহ্বান • Emergency Transfusion Request</p>
    </div>
    <div style="padding: 24px; color: #0f172a;">
      <p style="font-size: 15px; margin-top: 0;">প্রিয় <strong>${donorName}</strong>,</p>
      <p style="font-size: 14px; line-height: 1.6; color: #334155;">
        আপনার এলাকায় <strong>${hospital}</strong>-এ চিকিৎসাধীন রোগী <strong>${patientName}</strong>-এর জন্য জরুরী ভিত্তিতে <strong>${bloodGroup}</strong> রক্তের প্রয়োজন।
      </p>
      <div style="background: #f8fafc; border-left: 4px solid #dc2626; padding: 14px 18px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 4px 0; font-size: 13px;"><strong>হাসপাতাল:</strong> ${hospital}, ${district}</p>
        <p style="margin: 4px 0; font-size: 13px;"><strong>প্রয়োজনীয় রক্ত:</strong> <span style="color: #dc2626; font-weight: 800;">${bloodGroup}</span></p>
        <p style="margin: 4px 0; font-size: 13px;"><strong>অবস্থা:</strong> ডাক্তার কর্তৃক অনুমোদিত ও ভেরিফাইড</p>
      </div>
      <p style="font-size: 14px; line-height: 1.6; color: #334155;">
        আপনি যদি আজ সুস্থ থাকেন এবং গত ৯০ দিনে রক্তদান না করে থাকেন, তবে দয়া করে নিচে ক্লিক করে কেসটি গ্রহণ করুন:
      </p>
      <div style="text-align: center; margin: 28px 0;">
        <a href="https://bloodandlife.org/requests/${caseId}" style="background: #dc2626; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">
          কেস বিস্তারিত দেখুন ও রক্ত দিন (View Case)
        </a>
      </div>
      <p style="font-size: 12px; color: #64748b; line-height: 1.5; border-top: 1px solid #e2e8f0; padding-top: 16px; margin-bottom: 0;">
        BLOOD&LIFE (ব্লাড অ্যান্ড লাইফ) একটি সম্পূর্ণ অলাভজনক ও উন্মুক্ত জীবনরক্ষাকারী সেবা। রক্তের জন্য কাউকে কোনো আর্থিক লেনদেন করবেন না।
      </p>
    </div>
  </div>
  `;
}
