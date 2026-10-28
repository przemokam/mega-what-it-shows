import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { mdsvex } from 'mdsvex';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const runbook = fileURLToPath(new URL('./src/lib/layouts/runbook.svelte', import.meta.url));

// The kb renders as a static site: every page is prerendered from src/routes/kb.
export default defineConfig({
  plugins: [
    sveltekit({
      adapter: adapter({ pages: 'rendered', assets: 'rendered', strict: true }),
      extensions: ['.svelte', '.svx'],
      preprocess: [mdsvex({ extensions: ['.svx'], layout: { runbook } })],
    }),
  ],
});
