import { x } from "./callback";
import def, { a } from "./target";

// we don't want to pollute other checks' logs...
if (0 > 1) console.log(x);

console.log(`>>>>>> ${a} ${def}`);
