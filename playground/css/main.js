import "./minify.css";
import "./imported.css";
import "./sugarss.sss";
import "./sass.scss";
import "./less.less";
import "./stylus.styl";
import "./manual-chunk.css";

import charset from "./charset.css?inline";
import composesPathResolvingMod from "./composes-path-resolving.module.css";
import inlineMod from "./inline.module.css?inline";
import mod from "./mod.module.css";
import sassMod from "./mod.module.scss";
import rawCss from "./raw-imported.css?raw";
import { a as treeshakeMod } from "./treeshake-module/index.js";
import urlCss from "./url-imported.css?url";

import "./layered/index.css";
import "./dep.css";
import "./glob-dep.css";

// eslint-disable-next-line import-x/order
import { barModuleClasses } from "@vitejs/test-css-js-dep";

// inlined
import inlined from "./inlined.css?inline";
// The file is jsfile.css.js, and we should be able to import it without extension
import jsFileMessage from "./jsfile.css";
import postcssSourceInput from "./postcss-source-input.css?inline&query=foo";

import "#alias";

import aliasModule from "#alias-module";
import aliasContent from "#alias?inline";

import "./unsupported.css";
import "./async/index";
import "./imports-imports-field.css";

appendLinkStylesheet(urlCss);

text(".raw-imported-css", rawCss);

document.querySelector(".modules").classList.add(mod["apply-color"]);
text(".modules-code", JSON.stringify(mod, null, 2));

document.querySelector(".modules-sass").classList.add(sassMod["apply-color"]);
text(".modules-sass-code", JSON.stringify(sassMod, null, 2));

document
	.querySelector(".modules-treeshake")
	.classList.add(treeshakeMod()["treeshake-module-a"]);

document
	.querySelector(".path-resolved-modules-css")
	.classList.add(
		...composesPathResolvingMod["path-resolving-css"].split(" "),
	);
document
	.querySelector(".path-resolved-modules-sass")
	.classList.add(
		...composesPathResolvingMod["path-resolving-sass"].split(" "),
	);
document
	.querySelector(".path-resolved-modules-less")
	.classList.add(
		...composesPathResolvingMod["path-resolving-less"].split(" "),
	);
text(
	".path-resolved-modules-code",
	JSON.stringify(composesPathResolvingMod, null, 2),
);

text(".modules-inline", inlineMod);

text(".charset-css", charset);

document
	.querySelector(".css-js-dep-module")
	.classList.add(barModuleClasses.cssJsDepModule);

function text(el, text) {
	document.querySelector(el).textContent = text;
}

function appendLinkStylesheet(href) {
	const link = document.createElement("link");
	link.rel = "stylesheet";
	link.href = href;
	document.head.appendChild(link);
}

if (import.meta.hot) {
	import.meta.hot.accept("./mod.module.css", (newMod) => {
		const list = document.querySelector(".modules").classList;
		list.remove(mod.applyColor);
		list.add(newMod.applyColor);
		text(".modules-code", JSON.stringify(newMod.default, null, 2));
	});

	import.meta.hot.accept("./mod.module.scss", (newMod) => {
		const list = document.querySelector(".modules-sass").classList;
		list.remove(mod.applyColor);
		list.add(newMod.applyColor);
		text(".modules-sass-code", JSON.stringify(newMod.default, null, 2));
	});
}

// async
import("./async");

if (import.meta.env.DEV) {
	import("./async-treeshaken");
}

text(".inlined-code", inlined);

// glob
const glob = import.meta.glob("./glob-import/*.css", { query: "?inline" });
Promise.all(
	Object.keys(glob).map((key) => glob[key]().then((i) => i.default)),
).then((res) => {
	text(".imported-css-glob", JSON.stringify(res, null, 2));
});

// globEager
const globEager = import.meta.glob("./glob-import/*.css", {
	eager: true,
	query: "?inline",
});
text(".imported-css-globEager", JSON.stringify(globEager, null, 2));

text(".postcss-source-input", postcssSourceInput);

text(".jsfile-css-js", jsFileMessage);

text(".aliased-content", aliasContent);

document
	.querySelector(".aliased-module")
	.classList.add(aliasModule.aliasedModule);

import("./same-name/sub1/sub");
import("./same-name/sub2/sub");
