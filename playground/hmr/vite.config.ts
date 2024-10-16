import fs from "node:fs/promises";
import path from "node:path";
import { defineConfig, type Plugin } from "vite";

export default defineConfig({
	experimental: {
		hmrPartialAccept: true,
	},
	plugins: [
		{
			name: "mock-custom",
			async handleHotUpdate({ file, read, server }) {
				if (file.endsWith("customFile.js")) {
					const content = await read();
					const msg = content.match(/export const msg = '(\w+)'/)[1];
					server.hot.send("custom:foo", { msg });
					server.hot.send("custom:remove", { msg });
				}
			},
			configureServer(server) {
				server.hot.on("custom:remote-add", ({ a, b }, client) => {
					client.send("custom:remote-add-result", { result: a + b });
				});
			},
		},
		virtualPlugin(),
		transformCountPlugin(),
		watchCssDepsPlugin(),
	],
});

function virtualPlugin(): Plugin {
	let num = 0;
	return {
		name: "virtual-file",
		resolveId(id) {
			if (id === "virtual:file") {
				return "\0virtual:file";
			}
		},
		load(id) {
			if (id === "\0virtual:file") {
				return `\
import { virtual as _virtual } from "/importedVirtual.js";
export const virtual = _virtual + '${num}';`;
			}
		},
		configureServer(server) {
			server.hot.on("virtual:increment", async () => {
				const mod =
					await server.moduleGraph.getModuleByUrl("\0virtual:file");
				if (mod) {
					num++;
					server.reloadModule(mod);
				}
			});
		},
	};
}

function transformCountPlugin(): Plugin {
	let num = 0;
	return {
		name: "transform-count",
		transform(code) {
			if (code.includes("__TRANSFORM_COUNT__")) {
				return code.replace("__TRANSFORM_COUNT__", String(++num));
			}
		},
	};
}

function watchCssDepsPlugin(): Plugin {
	return {
		name: "watch-css-deps",
		async transform(code, id) {
			// replace the `replaced` identifier in the CSS file with the adjacent
			// `dep.js` file's `color` variable.
			if (id.includes("css-deps/main.css")) {
				const depPath = path.resolve(__dirname, "./css-deps/dep.js");
				const dep = await fs.readFile(depPath, "utf-8");
				const color = dep.match(/color = '(.+?)'/)[1];
				this.addWatchFile(depPath);
				return code.replace("replaced", color);
			}
		},
	};
}
