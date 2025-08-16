<script lang="ts">
	import { auth } from '$lib/firebase';
	import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

	let email = '';
	let password = '';
	let errorMsg = '';

	const signup = async () => {
		try {
			const userCredential = await createUserWithEmailAndPassword(auth, email, password);
			alert(`회원가입 성공: ${userCredential.user.email}`);
		} catch (err: any) {
			errorMsg = err.message;
		}
	};

	const login = async () => {
		try {
			const userCredential = await signInWithEmailAndPassword(auth, email, password);
			alert(`로그인 성공: ${userCredential.user.email}`);
		} catch (err: any) {
			errorMsg = err.message;
		}
	};
</script>

<input type="email" bind:value={email} placeholder="이메일" />
<input type="password" bind:value={password} placeholder="비밀번호" />
<button on:click={signup}>회원가입</button>
<button on:click={login}>로그인</button>
<p style="color:red">{errorMsg}</p>
