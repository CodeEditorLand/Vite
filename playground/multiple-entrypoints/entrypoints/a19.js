import a20 from "./a20";
import a21 from "./a21";
import a22 from "./a22";
import a23 from "./a23";
import a24 from "./a24";

export const that = () => import("./a18.js");

export function other() {
	return a20() + a21() + a22() + a23() + a24();
}

export default function () {
	return 123;
}
