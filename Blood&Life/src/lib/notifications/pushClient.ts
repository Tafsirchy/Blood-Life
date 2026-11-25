/**
 * Client-side Web Push Registration & Subscription Helper
 */

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export async function getCurrentPushSubscription(): Promise<globalThis.PushSubscription | null> {
  if (!isPushSupported()) return null;
  try {
    const reg = await navigator.serviceWorker.getRegistration("/sw.js");
    if (!reg) return null;
    return await reg.pushManager.getSubscription();
  } catch {
    return null;
  }
}

export async function subscribeToBrowserPush(): Promise<{ success: boolean; error?: string }> {
  if (!isPushSupported()) {
    return { success: false, error: "Browser does not support push notifications." };
  }

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!publicKey) {
    return { success: false, error: "Push VAPID public key is missing." };
  }

  try {
    const permission = await window.Notification.requestPermission();
    if (permission !== "granted") {
      return { success: false, error: "Notification permission denied." };
    }

    const registration = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;

    const existing = await registration.pushManager.getSubscription();
    const subscription =
      existing ||
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as unknown as BufferSource,
      }));

    const json = subscription.toJSON();
    const res = await fetch("/api/notifications/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        endpoint: json.endpoint,
        keys: json.keys,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { success: false, error: data.error || "Subscription save failed." };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to enable push notifications." };
  }
}

export async function unsubscribeFromBrowserPush(): Promise<{ success: boolean }> {
  if (!isPushSupported()) return { success: false };
  try {
    const sub = await getCurrentPushSubscription();
    if (sub) {
      await fetch("/api/notifications/subscribe", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: sub.endpoint }),
      });
      await sub.unsubscribe();
    } else {
      await fetch("/api/notifications/subscribe", { method: "DELETE" });
    }
    return { success: true };
  } catch {
    return { success: false };
  }
}
