<script lang="ts">
	import { io, Socket } from 'socket.io-client';
	import { onMount } from 'svelte';

	let socket: Socket;
	let message = '';

	onMount(() => {
		socket = io('http://localhost:3000');

		socket.on('connect', () => {
			console.log('Connected:', socket.id);
		});

		socket.on('serverMessage', (data) => {
			console.log('📩 From Server:', data);
		});

		return () => {
			socket.disconnect();
		};
	});

	function sendMessage() {
		if (message.trim()) {
			socket.emit('clientMessage', message); // 서버로 전송
			message = '';
		}
	}
</script>

<main class="space-y-4 p-4">
	<h1 class="text-2xl font-bold">Socket.io Chat Example</h1>
	<div class="flex space-x-2">
		<input
			class="flex-1 rounded border p-2"
			bind:value={message}
			placeholder="메세지를 입력하세요"
			on:keydown={(e) => e.key === 'Enter' && sendMessage()}
		/>
		<button class="rounded bg-blue-500 px-4 py-2 text-white" on:click={sendMessage}> Send </button>
	</div>
</main>
