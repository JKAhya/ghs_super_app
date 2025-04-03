import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	server: {
    allowedHosts: ['44a2-125-189-52-39.ngrok-free.app'],
    // 기타 서버 옵션들
  },
	plugins: [tailwindcss(), sveltekit()]
});
