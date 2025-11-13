// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	server: {
		port: 4340,
	},
	site: 'https://dragan.github.io',
	// Uncomment and set this to your repo name if deploying to a project page
	// base: '/womb',
});
