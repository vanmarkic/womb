// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	server: {
		port: 4340,
	},
	site: 'https://vanmarkic.github.io',
	base: '/womb',
});
