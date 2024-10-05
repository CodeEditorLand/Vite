// test importing node built-ins
import fs from "node:fs";
import { useState } from "react";

// test dep with css/asset imports
import "./test.css";

export { msg } from "./foo.js";

export function useCount() {
	return useState(0);
}

if (false) {
	fs.readFileSync();
} else {
	console.log("ok");
}

export { default as VueSFC } from "./Test.vue";
