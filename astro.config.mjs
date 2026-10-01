// @ts-check
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';

const sourceDirectory = fileURLToPath(new URL('./src/', import.meta.url));

// https://astro.build/config
export default defineConfig({
	vite: {
		css: {
			preprocessorOptions: {
				scss: {
					additionalData: '@use "styles/variables" as *;\n',
					loadPaths: [sourceDirectory],
				},
			},
		},
	},
});
