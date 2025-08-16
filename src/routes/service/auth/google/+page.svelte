<script lang="ts">
	import { auth, googleProvider } from '$lib/firebase';
	import { signInWithPopup } from 'firebase/auth';
	import type { User } from 'firebase/auth';
	import { currentUser } from '$lib/stores/user';

	let errorMsg = '';

	const loginWithGoogle = async () => {
		try {
			const result = await signInWithPopup(auth, googleProvider);
			currentUser.set(result.user); // store에 저장
			alert(`환영합니다, ${result.user.displayName}`);
		} catch (err: any) {
			errorMsg = err.message;
		}
	};
</script>

<button on:click={loginWithGoogle}>Google로 로그인</button>
<p style="color:red">{errorMsg}</p>
