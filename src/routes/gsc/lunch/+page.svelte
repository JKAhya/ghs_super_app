<script lang="ts">
	import { io, Socket } from "socket.io-client";
	import { onMount } from "svelte";

	let socket: Socket;
	let message = "";

	onMount(() => {
		socket = io("http://localhost:3000");

		socket.on("connect", () => {
			console.log("Connected:", socket.id);
		});

		socket.on("serverMessage", (data) => {
			console.log("📩 From Server:", data);
		});

		return () => {
			socket.disconnect();
		};
	});

	function sendMessage() {
		if (message.trim()) {
			socket.emit("clientMessage", message); // 서버로 전송
			message = "";
		}
	}
</script>

<main class="p-4 space-y-4">
	<h1 class="text-2xl font-bold">Socket.io Chat Example</h1>
	<div class="flex space-x-2">
		<input
			class="border p-2 flex-1 rounded"
			bind:value={message}
			placeholder="메세지를 입력하세요"
			on:keydown={(e) => e.key === 'Enter' && sendMessage()}
		/>
		<button class="bg-blue-500 text-white px-4 py-2 rounded" on:click={sendMessage}>
			Send
		</button>
	</div>
</main>
