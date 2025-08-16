<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	let { children } = $props();
	import { auth } from '$lib/firebase';
	import { onAuthStateChanged, type User } from 'firebase/auth';
	import { currentUser } from '$lib/stores/user';

	let user = null;

	import { page } from '$app/state';

	let currentUrl = $derived(page.url.href);

	let webManifestLink = '';

	import { firebaseApp, messagingPromise, onMessage } from '$lib/firebase';
	import { getToken } from 'firebase/messaging';

	let fcmToken: string | null = null;
	let supported = true;

	onMount(async () => {
		onAuthStateChanged(auth, (user: User | null) => {
			currentUser.set(user); // 로그인/로그아웃 상태를 전역 store에 반영
		});
		// PWA plugin handles registration. We just check for support
		// and set up foreground message handling.
		if (!('serviceWorker' in navigator)) {
			supported = false;
			return;
		}

		try {
			const messaging = await messagingPromise;
			if (!messaging) {
				supported = false;
				return;
			}

			// Handle messages that arrive while the app is in the foreground
			onMessage(messaging, (payload) => {
				console.log('📩 Foreground Message:', payload);
				const title = payload?.notification?.title ?? '새 공지';
				const body = payload?.notification?.body ?? '';
				alert(`${title}
${body}`);
			});
		} catch (e) {
			console.error('Error setting up foreground messaging:', e);
			supported = false;
		}
	});

	async function enablePush() {
		try {
			if (!('serviceWorker' in navigator)) {
				alert('이 브라우저/환경에서는 푸시가 지원되지 않습니다.');
				return;
			}

			// iOS/Safari requires permission request in a user gesture
			const permission = await Notification.requestPermission();
			if (permission !== 'granted') {
				alert('알림 권한이 거부되었습니다.');
				return;
			}

			const messaging = await messagingPromise;
			// Get the active service worker registration
			const reg = await navigator.serviceWorker.ready;

			if (!messaging) return;

			// VAPID public key (Firebase Console > Cloud Messaging > Web Config)
			const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY as string;

			fcmToken = await getToken(messaging, {
				vapidKey,
				serviceWorkerRegistration: reg
			});

			console.log('FCM token:', fcmToken);

			// TODO: Send this token to your backend to store it
			// await fetch('/api/push/register', { method:'POST', body: JSON.stringify({ token: fcmToken }) })
			alert('푸시 알림이 활성화되었습니다.');
		} catch (e) {
			console.error('enablePush error', e);
			alert('푸시 활성화 중 오류가 발생했습니다.');
		}
	}
</script>

{#if currentUrl.includes('timetable')}
	<div class="bg-base-200">{@render children()}</div>
{:else}
	{#if currentUrl.includes('home')}
		<div class=" mt-7 pb-4 text-center text-2xl">기흥고 생활정보</div>
		<div class="flex w-full items-center justify-center px-5 py-2 text-center text-base">
			<div
				class="bg-base-200 rounded-box gap-4s flex w-full max-w-4xl flex-col items-center px-5 py-5"
			>
				<div
					class="text-primary bg-base-100 mb-2 w-45 rounded-xl text-center text-lg font-bold subpixel-antialiased"
				>
					📍기흥고등학교
				</div>
				하나의 사이트에서 급식부터 시간표까지,<br /> 기흥고 생활의 모든 정보를
			</div>
		</div>
	{:else}
		<div class="relative mx-auto mt-6 flex w-full max-w-4xl items-center px-5">
			<button class="btn btn-ghost flex-shrink-0" on:click={() => history.back()}>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="currentColor"
					class="size-6"
				>
					<path
						fill-rule="evenodd"
						d="M7.72 12.53a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 1 1 1.06 1.06L9.31 12l6.97 6.97a.75.75 0 1 1-1.06 1.06l-7.5-7.5Z"
						clip-rule="evenodd"
					/>
				</svg>
			</button>

			<div class="absolute left-1/2 -translate-x-1/2 text-center text-xl">기흥고 생활정보</div>
		</div>
	{/if}

	{#if user}
		<p>환영합니다, {$currentUser.displayName || $currentUser.email}님!</p>
	{:else}
		<p>로그인하지 않았습니다.</p>
	{/if}

	<div class="w-full">
		{@render children()}
	</div>

	{fcmToken}

	<br /><br /><br />

	<!-- You can open the modal using ID.showModal() method -->
	<div class="flex w-full justify-center">
		<button class="btn btn-wide" on:click={() => document.getElementById('theme').showModal()}
			>설정</button
		>
	</div>
	<dialog id="theme" class="modal">
		<div class="modal-box">
			<form method="dialog">
				<button class="btn btn-sm btn-circle btn-ghost absolute top-2 right-2">✕</button>
			</form>
			<h3 class="text-lg font-bold">설정</h3>
			<fieldset class="fieldset">
				<label class="flex cursor-pointer items-center gap-2">
					<input
						type="radio"
						name="theme-radios"
						class="radio radio-sm theme-controller"
						value="default"
					/>
					기기설정 (기본값)
				</label>
				<label class="flex cursor-pointer items-center gap-2">
					<input
						type="radio"
						name="theme-radios"
						class="radio radio-sm theme-controller"
						value="light"
					/>
					라이트 모드
				</label>
				<label class="flex cursor-pointer items-center gap-2">
					<input
						type="radio"
						name="theme-radios"
						class="radio radio-sm theme-controller"
						value="dark"
					/>
					다크 모드
				</label>
			</fieldset>
			{#if supported}
				<button class="rounded bg-blue-600 px-4 py-2 text-white" on:click={enablePush}>
					공지 알림 켜기
				</button>
			{:else}
				<p>이 브라우저/환경에서는 푸시가 지원되지 않습니다.</p>
			{/if}
		</div>
	</dialog>

	<br /><br /><br /><br /><br /><br />

	<div class="dock dock-xl w-full rounded-xl text-center">
		<a href="/school" class:dock-active={currentUrl.includes('school')}>
			<span class="icon">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="currentColor"
					class="size-6"
				>
					<path
						d="M11.7 2.805a.75.75 0 0 1 .6 0A60.65 60.65 0 0 1 22.83 8.72a.75.75 0 0 1-.231 1.337 49.948 49.948 0 0 0-9.902 3.912l-.003.002c-.114.06-.227.119-.34.18a.75.75 0 0 1-.707 0A50.88 50.88 0 0 0 7.5 12.173v-.224c0-.131.067-.248.172-.311a54.615 54.615 0 0 1 4.653-2.52.75.75 0 0 0-.65-1.352 56.123 56.123 0 0 0-4.78 2.589 1.858 1.858 0 0 0-.859 1.228 49.803 49.803 0 0 0-4.634-1.527.75.75 0 0 1-.231-1.337A60.653 60.653 0 0 1 11.7 2.805Z"
					/>
					<path
						d="M13.06 15.473a48.45 48.45 0 0 1 7.666-3.282c.134 1.414.22 2.843.255 4.284a.75.75 0 0 1-.46.711 47.87 47.87 0 0 0-8.105 4.342.75.75 0 0 1-.832 0 47.87 47.87 0 0 0-8.104-4.342.75.75 0 0 1-.461-.71c.035-1.442.121-2.87.255-4.286.921.304 1.83.634 2.726.99v1.27a1.5 1.5 0 0 0-.14 2.508c-.09.38-.222.753-.397 1.11.452.213.901.434 1.346.66a6.727 6.727 0 0 0 .551-1.607 1.5 1.5 0 0 0 .14-2.67v-.645a48.549 48.549 0 0 1 3.44 1.667 2.25 2.25 0 0 0 2.12 0Z"
					/>
					<path
						d="M4.462 19.462c.42-.419.753-.89 1-1.395.453.214.902.435 1.347.662a6.742 6.742 0 0 1-1.286 1.794.75.75 0 0 1-1.06-1.06Z"
					/>
				</svg>
			</span>
			<span class="dock-label">
				<div class="text-sm">학교</div>
			</span>
		</a>

		<a href="/route/map/1f/" class:dock-active={currentUrl.includes('route')}>
			<div class="icon">
				<div class="text-2xl">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="currentColor"
						class="size-6"
					>
						<path
							fill-rule="evenodd"
							d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
							clip-rule="evenodd"
						/>
					</svg>
				</div>
				<span class="text-sm">지도</span>
			</div>
		</a>

		<a href="/home" class:dock-active={currentUrl.includes('home')}>
			<span class="icon">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="currentColor"
					class="size-6"
				>
					<path
						d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z"
					/>
					<path
						d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z"
					/>
				</svg>
			</span>
			<span class="dock-label">
				<div class="text-sm">홈</div>
			</span>
		</a>

		<a href="/life" class:dock-active={currentUrl.includes('life')}>
			<span class="icon">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="currentColor"
					class="size-6"
				>
					<path
						fill-rule="evenodd"
						d="M4.125 3C3.089 3 2.25 3.84 2.25 4.875V18a3 3 0 0 0 3 3h15a3 3 0 0 1-3-3V4.875C17.25 3.839 16.41 3 15.375 3H4.125ZM12 9.75a.75.75 0 0 0 0 1.5h1.5a.75.75 0 0 0 0-1.5H12Zm-.75-2.25a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5H12a.75.75 0 0 1-.75-.75ZM6 12.75a.75.75 0 0 0 0 1.5h7.5a.75.75 0 0 0 0-1.5H6Zm-.75 3.75a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5H6a.75.75 0 0 1-.75-.75ZM6 6.75a.75.75 0 0 0-.75.75v3c0 .414.336.75.75.75h3a.75.75 0 0 0 .75-.75v-3A.75.75 0 0 0 9 6.75H6Z"
						clip-rule="evenodd"
					/>
					<path d="M18.75 6.75h1.875c.621 0 1.125.504 1.125 1.125V18a1.5 1.5 0 0 1-3 0V6.75Z" />
				</svg>
			</span>
			<span class="dock-label">
				<div class="text-sm">생활</div>
			</span>
		</a>

		<a href="/list" class:dock-active={currentUrl.includes('list')}>
			<span class="icon">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="currentColor"
					class="size-6"
				>
					<path
						fill-rule="evenodd"
						d="M3 5.25a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 5.25Zm0 4.5A.75.75 0 0 1 3.75 9h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 9.75Zm0 4.5a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Zm0 4.5a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z"
						clip-rule="evenodd"
					/>
				</svg>
			</span>
			<span class="dock-label">
				<div class="text-sm">전체</div>
			</span>
		</a>
	</div>
{/if}
