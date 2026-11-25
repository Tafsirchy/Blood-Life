// BLOOD&LIFE Web Push Service Worker
self.addEventListener("push", function (event) {
  if (!event.data) return;

  try {
    const payload = event.data.json();
    const title = payload.title || "BLOOD&LIFE (ব্লাড অ্যান্ড লাইফ) - Emergency Alert";
    const options = {
      body: payload.body || "A critical transfusion case requires your blood group.",
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      tag: payload.tag || "emergency-alert",
      data: {
        url: payload.url || "/",
      },
      vibrate: [200, 100, 200, 100, 400],
      actions: [
        {
          action: "open",
          title: "View Case (কেস দেখুন)",
        },
      ],
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    console.error("Push event parsing error:", err);
  }
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  const rawUrl = event.notification.data?.url || "/";
  const targetUrl = new URL(rawUrl, self.location.origin).href;
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
      for (const client of clientList) {
        if (client.url === targetUrl && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
