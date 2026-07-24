// Sakinah service worker — installability + gentle daily reminders.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

// Network-first passthrough: never serves stale app code.
self.addEventListener("fetch", (e) => {
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});

// Incoming reminder
self.addEventListener("push", (event) => {
  let payload = { title: "Sakinah", body: "Today's istighfar is still waiting.", url: "/" };
  try { if (event.data) payload = { ...payload, ...event.data.json() }; } catch (e) {}

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: "sakinah-daily",     // replaces any earlier one, never stacks up
      renotify: false,
      silent: false,
      data: { url: payload.url || "/" },
    })
  );
});

// Tapping the reminder opens the app (or focuses it if already open)
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if ("focus" in c) { c.navigate(url); return c.focus(); }
      }
      return self.clients.openWindow(url);
    })
  );
});
