import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { NavigationRoute, registerRoute, setCatchHandler } from "workbox-routing";
import { CacheFirst, NetworkFirst, NetworkOnly, StaleWhileRevalidate } from "workbox-strategies";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { ExpirationPlugin } from "workbox-expiration";

const DAY = 24 * 60 * 60;
const apiOrigin = new URL(import.meta.env.VITE_API_URL ?? "http://localhost:8000").origin;

const publicResponsesOnly = {
    cacheWillUpdate: async ({response}) =>
        response.headers.get("Cache-Control")?.includes("public") ? response : null,
};

const markAsCached = {
    cachedResponseWillBeUsed: async ({cachedResponse}) => {
        if (!cachedResponse) return cachedResponse;
        const headers = new Headers(cachedResponse.headers);
        headers.set("X-From-Cache", "true");
        return new Response(cachedResponse.body, {
            status: cachedResponse.status,
            statusText: cachedResponse.statusText,
            headers,
        });
    },
};

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

registerRoute(new NavigationRoute(new NetworkOnly()));

registerRoute(
    ({request}) => request.destination === "image",
    new CacheFirst({
        cacheName: "images",
        plugins: [
            new CacheableResponsePlugin({statuses: [0, 200]}),
            new ExpirationPlugin({maxEntries: 300, maxAgeSeconds: 30 * DAY}),
        ],
    }),
);

registerRoute(
    ({url}) => url.origin === "https://fonts.googleapis.com",
    new StaleWhileRevalidate({
        cacheName: "font-styles",
        plugins: [
            new CacheableResponsePlugin({statuses: [0, 200]}),
            new ExpirationPlugin({maxEntries: 5, maxAgeSeconds: 365 * DAY}),
        ],
    }),
);

registerRoute(
    ({url}) => url.origin === "https://fonts.gstatic.com",
    new CacheFirst({
        cacheName: "font-files",
        plugins: [
            new CacheableResponsePlugin({statuses: [0, 200]}),
            new ExpirationPlugin({maxEntries: 30, maxAgeSeconds: 365 * DAY}),
        ],
    }),
);

registerRoute(
    ({url}) => url.origin === apiOrigin,
    new NetworkFirst({
        cacheName: "public-api",
        networkTimeoutSeconds: 5,
        plugins: [
            publicResponsesOnly,
            markAsCached,
            new ExpirationPlugin({maxEntries: 60, maxAgeSeconds: 7 * DAY}),
        ],
    }),
);

setCatchHandler(({request}) => {
    if (request.mode === "navigate") {
        return Response.redirect(`${self.registration.scope}#/offline`, 302);
    }
    return Response.error();
});

self.addEventListener("message", (event) => {
    if (event.data?.type === "SKIP_WAITING") {
        self.skipWaiting();
    }
});
