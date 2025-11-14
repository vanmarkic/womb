// @ts-check
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import compress from 'astro-compress';

// https://astro.build/config
export default defineConfig({
	integrations: [
		preact(),
		compress({
			css: true,
			html: true,
			js: true,
			img: false, // Don't compress images, they're already optimized
			svg: true,
		})
	],
	server: {
		port: 4340,
	},
	site: 'https://vanmarkic.github.io',
	base: '/womb',
	vite: {
		build: {
			assetsInlineLimit: 4096, // Inline small assets
			rollupOptions: {
				output: {
					manualChunks: {
						'radix': ['@radix-ui/react-dialog'],
					}
				}
			}
		},
		ssr: {
			noExternal: ['@radix-ui/*'] // Bundle Radix UI
		}
	},
	image: {
		domains: ['vanmarkic.github.io'],
	},
	build: {
		inlineStylesheets: 'auto' // Inline critical CSS
	}
});
