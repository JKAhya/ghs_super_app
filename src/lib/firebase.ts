import { initializeApp } from 'firebase/app';
import { getMessaging, isSupported, onMessage, type Messaging } from 'firebase/messaging';

export const firebaseApp = initializeApp({
	apiKey: 'AIzaSyBWw_3cx3vbIpHlxgOVZOiljKG61qM_MeM',
	authDomain: 'ghs-auth-2af48.firebaseapp.com',
	projectId: 'ghs-auth-2af48',
	storageBucket: 'ghs-auth-2af48.firebasestorage.app',
	messagingSenderId: '423388492166',
	appId: '1:423388492166:web:7321a625b0bce6fdf57c07',
	measurementId: 'G-9NHLJLPN8E'
});

export const messagingPromise: Promise<Messaging | null> = isSupported().then((supported) =>
	supported ? getMessaging(firebaseApp) : null
);

export { onMessage };
