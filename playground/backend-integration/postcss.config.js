import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
	plugins: {
		tailwindcss: { config: __dirname + "/tailwind.config.js" },
	},
};
