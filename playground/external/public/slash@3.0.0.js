/* eslint-disable */
// copied from https://esm.sh/v133/slash@3.0.0/es2022/slash.mjs to reduce network issues in CI

/* esm.sh - esbuild bundle(slash@3.0.0) es2022 production */
var a = Object.create;
var d = Object.defineProperty;
var m = Object.getOwnPropertyDescriptor;
var x = Object.getOwnPropertyNames;
var g = Object.getPrototypeOf,
	p = Object.prototype.hasOwnProperty;
var A = (e, t) => () => (t || e((t = { exports: {} }).exports, t), t.exports),
	E = (e, t) => {
		for (var r in t) d(e, r, { get: t[r], enumerable: !0 });
	},
	u = (e, t, r, i) => {
		if ((t && typeof t == "object") || typeof t == "function")
			for (let n of x(t))
				!p.call(e, n) &&
					n !== r &&
					d(e, n, {
						get: () => t[n],
						enumerable: !(i = m(t, n)) || i.enumerable,
					});
		return e;
	},
	o = (e, t, r) => (u(e, t, "default"), r && u(r, t, "default")),
	c = (e, t, r) => (
		(r = e != null ? a(g(e)) : {}),
		u(
			t || !e || !e.__esModule
				? d(r, "default", { value: e, enumerable: !0 })
				: r,
			e,
		)
	);
var f = A((h, _) => {
	"use strict";
	_.exports = (e) => {
		let t = /^\\\\\?\\/.test(e),
			r = /[^\u0000-\u0080]+/.test(e);
		return t || r ? e : e.replace(/\\/g, "/");
	};
});
var s = {};
E(s, { default: () => P });
var L = c(f());
o(s, c(f()));
var { default: l, ...N } = L,
	P = l !== void 0 ? l : N;
export { P as default };
