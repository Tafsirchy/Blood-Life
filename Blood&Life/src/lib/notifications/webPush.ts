import * as webpush from "web-push";

// Environment VAPID keys - strictly no hardcoded fallback secrets in production
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidEmail = process.env.VAPID_EMAIL || "mailto:contact@bloodlagbe.org";

let vapidConfigured = false;
if (vapidPublicKey && vapidPrivateKey) {
  try {
    webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);
    vapidConfigured = true;
  } catch (err) {
    console.warn("VAPID setup notice:", err);
  }
} else if (process.env.NODE_ENV === "production") {
  console.warn("VAPID credentials missing in production environment. Web push will be disabled.");
}

export interface PushPayload {
  title: string;
  body: string;
  tag?: string;
  url?: string;
}

export async function sendWebPush(
  subscription: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  },
  payload: PushPayload
) {
  if (!vapidConfigured) {
    return { success: false, error: "VAPID is not configured" };
  }

  try {
    const stringPayload = JSON.stringify(payload);
    const result = await webpush.sendNotification(subscription, stringPayload);
    return { success: true, statusCode: result.statusCode };
  } catch (error: any) {
    console.error("Web Push Error:", error?.statusCode, error?.message);
    return { success: false, error: error?.message };
  }
}
