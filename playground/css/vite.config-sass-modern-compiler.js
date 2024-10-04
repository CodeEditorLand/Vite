import { defineConfig } from "vite";

import configSassModern from "./vite.config-sass-modern.js";
import baseConfig from "./vite.config.js";

export default defineConfig({
	...baseConfig,
	css: {
		...baseConfig.css,
		preprocessorOptions: {
			...baseConfig.css.preprocessorOptions,
			scss: {
				...configSassModern.css.preprocessorOptions.scss,
			},
		},
	},
});
