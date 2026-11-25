/**
 * Free-Tier Resend API transactional & batch email sender
 * Delivers instant notification emails to donors, requesters, and volunteers.
 */

import { buildUrgentMatchEmailTemplate } from "@/lib/notifications/emailTemplates";

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
      const isSandboxRestricted = err.includes("only send testing emails to your own email address") || response.status === 403;
      if (isSandboxRestricted) {
        console.warn(
          `\n[Resend Sandbox Warning]: Delivery to "${recipients.join(", ")}" requires a verified domain at resend.com/domains and matching EMAIL_FROM.`
        );
      } else {
        console.error("Resend API delivery failed:", err);
      }
      return { success: false, error: err, isSandboxRestricted };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (err: any) {
    console.error("Resend fetch exception:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Sends personalized emails in chunks via Resend Batch API (up to 50 per batch)
 * to preserve recipient privacy (no email leakage) and respect rate limits.
 */
export async function sendBatchTransactionalEmails(items: SendEmailParams[]) {
  if (items.length === 0) {
    return { total: 0, sent: 0, failed: 0, mocked: false };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.EMAIL_FROM || "BLOOD&LIFE Emergency <onboarding@resend.dev>";

  if (process.env.NODE_ENV !== "production") {
    console.info(`[Batch Email Dispatch] Preparing ${items.length} personalized email(s).`);
  }

  if (!apiKey) {
    items.forEach((item) => {
      if (process.env.NODE_ENV !== "production") {
        console.info(`[Mock Batch Email] To: ${Array.isArray(item.to) ? item.to.join(",") : item.to} | ${item.subject}`);
      }
    });
    return { total: items.length, sent: items.length, failed: 0, mocked: true };
  }

  const CHUNK_SIZE = 50;
  let sent = 0;
  let failed = 0;

  for (let i = 0; i < items.length; i += CHUNK_SIZE) {
    const chunk = items.slice(i, i + CHUNK_SIZE);
    const batchPayload = chunk.map((item) => {
      const recipients = Array.isArray(item.to) ? item.to : [item.to];
      const plainText = item.text || item.html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      return {
        from: fromAddress,
        to: recipients,
        subject: item.subject,
        html: item.html,
        text: plainText,
        ...(item.replyTo ? { reply_to: item.replyTo } : {}),
      };
    });

    try {
      const response = await fetch("https://api.resend.com/emails/batch", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(batchPayload),
      });

      if (response.ok) {
        sent += chunk.length;
      } else {
        const err = await response.text();
        console.warn("Resend batch endpoint notice, falling back to throttled single send:", err);
        for (const single of chunk) {
          const singleRes = await sendTransactionalEmail(single);
          if (singleRes.success) sent++;
          else failed++;
          await new Promise((r) => setTimeout(r, 550));
        }
      }
    } catch (err) {
      console.error("Resend batch dispatch exception:", err);
      failed += chunk.length;
    }

    if (i + CHUNK_SIZE < items.length) {
      await new Promise((r) => setTimeout(r, 550));
    }
  }

  return { total: items.length, sent, failed, mocked: false };
}

export const sendEmail = sendTransactionalEmail;
export { buildUrgentMatchEmailTemplate };
