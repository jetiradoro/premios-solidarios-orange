// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import pwaSw from './integrations/pwa-sw.mjs';

// https://astro.build/config
export default defineConfig({
	output: 'static',
	integrations: [pwaSw()],
	vite: {
		plugins: [tailwindcss()],
		server: {
			proxy: {
				// Lee el HTML de la web origen sin CORS (en prod lo hace nginx)
				'/remote': {
					target: 'https://voluntariado.masorange.es',
					changeOrigin: true,
					rewrite: (path) => path.replace(/^\/remote/, ''),
				},
			},
		},
	},
});
