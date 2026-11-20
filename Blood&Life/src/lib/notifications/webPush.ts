import webpush from "web-push";

// Default or environment VAPID keys
const vapidPublicKey =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBKr3qBUYIHBQFLXYp5NkHz8U";
const vapidPrivateKey =
  process.env.VAPID_PRIVATE_KEY || "UUxI6Sg_pP_c4f5k-5x3l5m3v9c-B6F1x5z_V7l3s2Q";
const vapidEmail = process.env.VAPID_EMAIL || "mailto:contact@bloodlagbe.org";

try {
  webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);
} catch (err) {
  console.warn("VAPID setup notice:", err);
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
  try {
    const stringPayload = JSON.stringify(payload);
    const result = await webpush.sendNotification(subscription, stringPayload);
    return { success: true, statusCode: result.statusCode };
  } catch (error: any) {
    console.error("Web Push Error:", error?.statusCode, error?.message);
    return { success: false, error: error?.message };
  }
}
