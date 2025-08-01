import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	server: {
    allowedHosts: ['099174371465.ngrok-free.app'],
    // 기타 서버 옵션들
  },
	plugins: [tailwindcss(), sveltekit()],    
  optimizeDeps: {
        include: ['comcigan-parser'] // 'comcigan-parser'를 명시적으로 포함
    },    
    ssr: {
        noExternal: ['comcigan-parser'] // 이것도 추가해 보세요.
    }
});
