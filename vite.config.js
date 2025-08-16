import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

export default defineConfig({
	server: {
		allowedHosts: true
		// 기타 서버 옵션들
	},
	plugins: [
		tailwindcss(),
		sveltekit(),
		SvelteKitPWA({
			strategies: 'injectManifest',
			filename: 'service-worker.ts',
			srcDir: 'src',
			mode: 'production', // 개발 시에도 PWA 확인하려면 'development'
			scope: '/',
			base: '/',
			includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
			manifest: {
				name: '기흥고 생활정보 모아보기',
				short_name: '기흥고 생활정보 모아보기',
				start_url: '/home',
				display: 'standalone',
				theme_color: '#0069a8',
				icons: [
					{
						src: '/web-app-manifest-192x192.png',
						sizes: '192x192',
						type: 'image/png'
					},
					{
						src: '/web-app-manifest-512x512.png',
						sizes: '512x512',
						type: 'image/png'
					},
					{
						src: '/apple-touch-icon.png',
						sizes: '180x180',
						type: 'image/png',
						purpose: 'any'
					},
					{
						src: '/favicon-96x96.png',
						sizes: '96x96',
						type: 'image/png'
					},
					{
						src: '/favicon.ico',
						sizes: '48x48',
						type: 'image/x-icon'
					}
				]
			},
			workbox: {
				globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
				// Add the following to ensure the root SPA page is precached.
				// This is crucial for createHandlerBoundToURL('/') to work.
				navigateFallback: '/'
			}
		})
	],
	optimizeDeps: {
		include: ['comcigan-parser']
	},
	ssr: {
		noExternal: ['comcigan-parser'] // GPT가 시킴
	}
});
