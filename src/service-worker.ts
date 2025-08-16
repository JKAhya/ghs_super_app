import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';

// Workbox가 주입하는 프리캐시 리스트
declare let self: ServiceWorkerGlobalScope & { __WB_MANIFEST: any };

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// --- Firebase Messaging (백그라운드) ---
// compat 스크립트를 SW에서 로드 (가장 간단/안정)
declare const firebase: any;
// @ts-ignore
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
// @ts-ignore
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
	apiKey: 'AIzaSyBWw_3cx3vbIpHlxgOVZOiljKG61qM_MeM',
	authDomain: 'ghs-auth-2af48.firebaseapp.com',
	projectId: 'ghs-auth-2af48',
	storageBucket: 'ghs-auth-2af48.firebasestorage.app',
	messagingSenderId: '423388492166',
	appId: '1:423388492166:web:7321a625b0bce6fdf57c07',
	measurementId: 'G-9NHLJLPN8E'
});

const messaging = firebase.messaging();

// 푸시가 백그라운드에서 도착했을 때
messaging.onBackgroundMessage((payload: any) => {
	const title = payload?.notification?.title ?? '새 공지';
	const body = payload?.notification?.body ?? '';
	const url = payload?.data?.url ?? '/home';

	// @ts-ignore
	self.registration.showNotification(title, {
		body,
		icon: '/web-app-manifest-192x192.png',
		data: { url }
	});
});

// 사용자가 알림 클릭 시: 해당 URL로 열기/포커스
// @ts-ignore
self.addEventListener('notificationclick', (event: any) => {
	event.notification.close();
	const url = event.notification?.data?.url ?? '/home';
	// @ts-ignore
	event.waitUntil(
		// @ts-ignore
		self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
			const client = clients.find(
				(c: any) => 'focus' in c && (c.url?.includes(url) || c.url?.endsWith('/'))
			);
			if (client) {
				// @ts-ignore
				return (client as WindowClient).focus();
			}
			// @ts-ignore
			return self.clients.openWindow(url);
		})
	);
});
