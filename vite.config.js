import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	server: {
    allowedHosts: true,
    // 기타 서버 옵션들
  },
	plugins: [tailwindcss(), sveltekit()],    
  optimizeDeps: {
        include: ['comcigan-parser']
    },    
    ssr: {
        noExternal: ['comcigan-parser'] // GPT가 시킴
    }
});
