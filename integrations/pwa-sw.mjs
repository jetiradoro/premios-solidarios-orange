import { fileURLToPath } from 'node:url';
import { generateSW } from 'workbox-build';

/**
 * Genera dist/sw.js al terminar el build, con todas las páginas ya renderizadas
 * (ver specs/005-pwa-offline.md). No usamos @vite-pwa/astro: no soporta Astro 7.
 */
export default function pwaSw() {
	return {
		name: 'pwa-sw',
		hooks: {
			'astro:build:done': async ({ dir, logger }) => {
				const root = fileURLToPath(dir);
				const { count, size, warnings } = await generateSW({
					globDirectory: root,
					swDest: `${root}sw.js`,
					globPatterns: ['**/*.{html,js,css,svg,png,ico,webmanifest}'],
					globIgnores: ['sw.js', 'workbox-*.js'],
					cleanupOutdatedCaches: true,
					clientsClaim: true,
					skipWaiting: true,
					navigateFallback: undefined,
					runtimeCaching: [
						{
							// Los votos se gestionan en localStorage: nunca desde la caché del SW.
							urlPattern: ({ url }) => url.pathname.startsWith('/remote/'),
							handler: 'NetworkOnly',
						},
						{
							urlPattern: ({ url }) =>
								url.origin === 'https://voluntariado.masorange.es' && url.pathname.startsWith('/uploads/'),
							handler: 'CacheFirst',
							options: {
								cacheName: 'remote-images',
								cacheableResponse: { statuses: [0, 200] },
								expiration: { maxEntries: 400, maxAgeSeconds: 30 * 24 * 60 * 60 },
							},
						},
					],
				});
				warnings.forEach((w) => logger.warn(w));
				logger.info(`service worker: ${count} archivos precacheados (${(size / 1024).toFixed(0)} KiB)`);
			},
		},
	};
}
