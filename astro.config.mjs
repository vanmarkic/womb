// @ts-check
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';

// https://astro.build/config
export default defineConfig({
	integrations: [preact()],
	server: {
		port: 4340,
	},
	site: 'https://vanmarkic.github.io',
	base: '/womb',
	vite: {
		build: {
			assetsInlineLimit: 0 // Don't inline large media files
		}
	}
});
