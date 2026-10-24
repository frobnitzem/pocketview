/*! pocketview (Apache-2.0). Includes markdown-it (MIT), DOMPurify (Apache-2.0), hyphen (ISC) and the Source Serif 4 and Antonio fonts (SIL OFL 1.1): see licenses/. */
//#region \0rolldown/runtime.js
var e = Object.create, t = Object.defineProperty, n = Object.getOwnPropertyDescriptor, r = Object.getOwnPropertyNames, i = Object.getPrototypeOf, a = Object.prototype.hasOwnProperty, o = (e, t) => () => (t || (e((t = { exports: {} }).exports, t, t.exports), e = null), t.exports), s = (e, n) => {
	let r = {};
	for (var i in e) t(r, i, {
		get: e[i],
		enumerable: !0
	});
	return n || t(r, Symbol.toStringTag, { value: "Module" }), r;
}, c = (e, i, o, s) => {
	if (i && typeof i == "object" || typeof i == "function") for (var c = r(i), l = 0, u = c.length, d; l < u; l++) d = c[l], !a.call(e, d) && d !== o && t(e, d, {
		get: ((e) => i[e]).bind(null, d),
		enumerable: !(s = n(i, d)) || s.enumerable
	});
	return e;
}, l = (n, r, o) => (o = n == null ? {} : e(i(n)), c(r || !n || !n.__esModule || !a.call(n, "default") ? t(o, "default", {
	value: n,
	enumerable: !0
}) : o, n));
//#endregion
//#region ../core/src/json.ts
function u(e) {
	return e === null ? "null" : Array.isArray(e) ? "array" : typeof e;
}
var d = (e) => e.replace(/~/g, "~0").replace(/\//g, "~1"), f = (e, t) => `${e}/${d(t)}`;
function p(e, t, n, r) {
	let i = {
		ptr: n,
		label: t,
		value: e,
		kind: u(e),
		children: [],
		parent: r,
		depth: r ? r.depth + 1 : 0
	};
	return i.children = m(e).map(([e, t]) => p(t, e, f(n, e), i)), i;
}
function m(e) {
	return Array.isArray(e) ? e.map((e, t) => [String(t), e]) : typeof e == "object" && e ? Object.entries(e) : [];
}
function h(e, t) {
	return p(e, t ?? u(e), "", null);
}
function g(e, t, n, r) {
	let i = v(e, t);
	if (!i) return !1;
	if (i === e && i.label === i.kind && (i.label = u(n)), !_(i, n, r)) return !0;
	for (let e = i, t = i.parent; t; e = t, t = t.parent) {
		if (Array.isArray(t.value)) {
			let n = t.value.slice();
			n[Number(e.label)] = e.value, t.value = n;
		} else t.value = {
			...t.value,
			[e.label]: e.value
		};
		r(t);
	}
	return !0;
}
function _(e, t, n) {
	if (e.value === t) return !1;
	let r = u(t), i = r !== e.kind || r !== "object" && r !== "array", a = new Map(r === e.kind ? e.children.map((e) => [e.label, e]) : []), o = m(t).map(([t, r]) => {
		let o = a.get(t);
		return o ? (_(o, r, n) && (i = !0), o) : (i = !0, p(r, t, f(e.ptr, t), e));
	});
	return (o.length !== e.children.length || o.some((t, n) => t !== e.children[n])) && (i = !0), e.children = o, e.value = t, e.kind = r, i && n(e), i;
}
function v(e, t) {
	if (t === "") return e;
	let n = e;
	for (let e of t.slice(1).split("/")) {
		let t = e.replace(/~1/g, "/").replace(/~0/g, "~");
		if (n = n?.children.find((e) => e.label === t), !n) return;
	}
	return n;
}
function y(e) {
	let t = [];
	for (let n = e.parent; n; n = n.parent) t.unshift(n);
	return t;
}
function b(e) {
	return e.children.length === 0;
}
//#endregion
//#region ../core/src/theme.ts
var x = {
	unit: 8,
	rowH: 28,
	gap: 6,
	pad: 10,
	keyMin: 48,
	keyMax: 150,
	keyPad: 22,
	tagH: 26,
	tagPad: 20,
	chipH: 28,
	chipPad: 22,
	badgePad: 21,
	segH: 60,
	segGap: 4,
	crumbPad: 22,
	titleScale: 1.5,
	scrollMax: 280,
	scrollMin: 112,
	longText: 280,
	measure: 648,
	listMax: 960,
	keep: 16,
	depthDiscount: .7,
	maxDepth: 4,
	root: {
		bar: 36,
		side: 108,
		sideR: 12,
		outer: 44,
		inner: 16
	},
	frame: {
		bar: 24,
		side: 8,
		outer: 22,
		inner: 10
	}
}, S = 28;
function C(e, t) {
	let n = [...e].sort((e, t) => e.h - t.h || t.s - e.s), r = [], i = -Infinity;
	for (let e of n) e.s > i + 1e-9 && (r.push(e), i = e.s);
	if (r.length <= t) return r;
	let a = r[0].h, o = (e) => Math.log1p((e - a) / S), s = o(r[r.length - 1].h) || 1, c = [], l = -1, u = null;
	for (let e of r) {
		let n = Math.min(t - 1, Math.floor(o(e.h) / s * t));
		n === l ? c[c.length - 1] === u ? c.push(e) : c[c.length - 1] = e : (c.push(e), u = e, l = n);
	}
	return c;
}
function ee(e, t) {
	let n;
	for (let r of e) r.h <= t + 1e-6 && (!n || r.s > n.s) && (n = r);
	return n ? {
		point: n,
		fits: !0
	} : {
		point: e.reduce((e, t) => t.h < e.h ? t : e),
		fits: !1
	};
}
var w = (e, t) => e.kind === t && !b(e), te = [
	{
		id: "core/scalar",
		layout: "value",
		match: (e) => b(e) ? 0 : null,
		measure: (e, t, n) => n.leafOptions(e, t)
	},
	{
		id: "core/array",
		layout: "value",
		match: (e) => w(e, "array") ? 0 : null,
		measure: (e, t, n) => n.bareArray(e, t)
	},
	{
		id: "core/container",
		layout: "block",
		match: (e) => w(e, "array") ? 0 : null,
		measure: (e, t, n) => n.container(e, t)
	},
	{
		id: "core/frame",
		layout: "block",
		match: (e) => w(e, "object") ? 0 : null,
		measure: (e, t, n) => n.frame(e, t)
	}
], T = 1e4, E = .95, ne = 100, D = (e) => e?.stretch ?? 0;
function re(e, t, n) {
	let r = /* @__PURE__ */ new Map(), i = [...e.rows.filter((e) => e.opt)].sort((e, t) => Number(n(t.node)) - Number(n(e.node))), a = Math.min(t, e.stretch);
	for (let e of i) {
		let t = Math.min(a, D(e.opt));
		t > 0 && r.set(e, t), a -= t;
	}
	return r;
}
var ie = 3e3, ae = 2400;
function oe(e, t, n, r) {
	let i = [], a = 0, o = 0;
	for (let s of e) a > 0 && a + s > t && (a = 0, o += n + r), i.push({
		x: a,
		y: o
	}), a += s + r;
	return i.h = e.length ? o + n : 0, i;
}
function se(e) {
	return e.kind === "object" ? `{${e.children.length}}` : e.kind === "array" ? `[${e.children.length}]` : "";
}
function ce(e) {
	switch (e.kind) {
		case "string": return e.value;
		case "object": return "{ }";
		case "array": return "[ ]";
		default: return String(e.value);
	}
}
var le = {
	limit: Infinity,
	expanded: [],
	minified: [],
	windows: {},
	views: {}
}, ue = (e, t) => e === t || e.startsWith(`${t}/`), de = class {
	metrics;
	theme;
	intrinsic = /* @__PURE__ */ new WeakMap();
	options = /* @__PURE__ */ new WeakMap();
	sigs = /* @__PURE__ */ new WeakMap();
	version = 0;
	spec = le;
	expanded = /* @__PURE__ */ new Set();
	minified = /* @__PURE__ */ new Set();
	variants;
	constructor(e, t, n = []) {
		this.metrics = e, this.theme = t, this.variants = [...n, ...te];
	}
	setSpec(e) {
		this.spec = e, this.expanded = new Set(e.expanded.filter((t) => !e.minified.some((e) => ue(t, e)))), this.minified = new Set(e.minified), this.version++;
	}
	forget(e) {
		this.intrinsic.delete(e), this.options.delete(e), this.sigs.delete(e);
	}
	variantsFor(e) {
		return this.intrinsicOf(e, "vf", () => {
			let t = -Infinity, n = [];
			for (let r of this.variants) {
				let i = r.match(e);
				i !== null && (i > t ? (t = i, n = [r]) : i === t && n.push(r));
			}
			return n;
		});
	}
	snap(e) {
		return Math.max(0, Math.floor(e / this.theme.unit) * this.theme.unit);
	}
	windowOf(e) {
		return this.spec.windows[e.ptr] ?? { start: 0 };
	}
	prioritized(e) {
		for (let t of this.expanded) if (ue(t, e.ptr)) return !0;
		return !1;
	}
	minifiedNode(e) {
		return this.minified.has(e.ptr);
	}
	signature(e) {
		let t = this.sigs.get(e);
		if (t?.version === this.version) return t.sig;
		let { limit: n, expanded: r, minified: i, windows: a, views: o } = this.spec, s = (t) => [...t].filter((t) => ue(t, e.ptr)).sort(), c = JSON.stringify([
			n,
			s(r),
			s(i),
			s(Object.keys(a)).map((e) => [e, a[e]]),
			s(Object.keys(o)).map((e) => [e, o[e]])
		]);
		return this.sigs.set(e, {
			version: this.version,
			sig: c
		}), c;
	}
	intrinsicOf(e, t, n) {
		let r = this.intrinsic.get(e);
		if (r || this.intrinsic.set(e, r = /* @__PURE__ */ new Map()), r.has(t)) return r.get(t);
		let i = n();
		return r.set(t, i), i;
	}
	cached(e, t, n) {
		let r = this.signature(e), i = this.options.get(e);
		if ((!i || i.sig !== r) && this.options.set(e, i = {
			sig: r,
			entries: /* @__PURE__ */ new Map()
		}), i.entries.has(t)) return i.entries.get(t);
		let a = n();
		return i.entries.set(t, a), a;
	}
	keyWidth(e) {
		return this.intrinsicOf(e, "k", () => {
			let t = this.theme, n = Math.max(0, ...e.children.map((e) => this.metrics.key(e.label)));
			return Math.min(t.keyMax, Math.max(t.keyMin, Math.ceil(n + t.keyPad)));
		});
	}
	chipWidth(e, t = Infinity) {
		let n = se(e), r = Math.ceil(this.metrics.key(e.label) + this.theme.chipPad + (n ? this.metrics.key(n) + this.theme.badgePad : 0));
		return Math.min(r, Math.floor(t));
	}
	value(e, t) {
		let n = this.snap(t);
		return this.cached(e, `v|${n}`, () => this.tagged(e, n, n, "value"));
	}
	tagged(e, t, n, r) {
		let i = [];
		for (let a of this.variantsFor(e)) {
			if (r && a.layout !== r) continue;
			let o = a.layout === "block" ? t : n;
			if (!(o < 3 * this.theme.unit)) for (let t of a.measure(e, o, this)) i.push({
				...t,
				variant: a.id,
				layout: a.layout
			});
		}
		return i;
	}
	childOptions(e, t, n) {
		let r = this.spec.views[e.ptr];
		if (r !== void 0 && r !== e.ptr) return this.slot(e, r, this.snap(t));
		let [i, a] = [this.snap(t), this.snap(n)];
		return this.cached(e, `o|${i}|${a}`, () => this.tagged(e, i, a));
	}
	slot(e, t, n) {
		return this.cached(e, `s|${n}`, () => {
			let r = this.theme, i = e;
			for (let n of t.slice(e.ptr.length + 1).split("/")) {
				let e = n.replace(/~1/g, "/").replace(/~0/g, "~");
				i = i?.children.find((t) => t.label === e);
			}
			if (!i || !t.startsWith(`${e.ptr}/`)) return this.tagged(e, n, n);
			let a = i, o = (t, r) => ({
				w: n,
				h: r,
				s: t.s + 1,
				stretch: t.stretch ?? 0,
				layout: "block",
				variant: "core/slot",
				v: {
					t: "slot",
					slot: e,
					node: a,
					inner: t,
					w: n,
					h: r
				}
			});
			if (a.kind === "object" && !b(a)) return this.frame(a, n).map((e) => o(e, e.h));
			if (a.kind === "array" && !b(a)) return this.container(a, n).map((e) => o(e, e.h));
			let s = r.frame.bar;
			return this.leafOptions(a, n - 2 * r.pad).map((e) => o(e, s + 2 * r.pad + e.h));
		});
	}
	leafOptions(e, t) {
		let n = this.snap(t);
		return this.intrinsicOf(e, `l|${n}`, () => this.leaf(e, n));
	}
	bareArray(e, t) {
		let n = this.snap(t);
		return this.cached(e, `a|${n}`, () => this.array(e, n));
	}
	leaf(e, t) {
		let n = this.theme, r = ce(e), i = this.metrics.value(r);
		if (!r.includes("\n") && i <= t) return [{
			w: Math.ceil(i),
			h: n.rowH,
			s: 1,
			v: {
				t: "token",
				text: r,
				w: Math.ceil(i)
			}
		}];
		let a = e.kind === "string" ? e.value : r, o = Math.min(4, 1 + a.length / 400);
		if (a.length > ie) {
			let e = a.slice(0, 400), r = this.metrics.value(e) / Math.max(1, e.length), i = Math.ceil(a.length * r / Math.max(1, t)) * n.rowH;
			return [{
				w: t,
				h: n.scrollMin,
				s: o * (.5 + .5 * n.scrollMin / i),
				stretch: Math.max(0, i - n.scrollMin),
				v: {
					t: "text",
					text: a,
					style: "typeset",
					w: t,
					h: n.scrollMin,
					full: i,
					scroll: !0
				}
			}];
		}
		let s = a.length > n.longText || a.includes("\n") ? "typeset" : "plain", c = Math.ceil(this.metrics.text(e.ptr, a, s).height(t)), l = [{
			w: t,
			h: Math.max(n.rowH, c),
			s: o,
			v: {
				t: "text",
				text: a,
				style: s,
				w: t,
				h: c,
				full: c,
				scroll: !1
			}
		}];
		return c > n.scrollMin + n.rowH && l.push({
			w: t,
			h: n.scrollMin,
			s: o * (.5 + .5 * n.scrollMin / c),
			stretch: c - n.scrollMin,
			v: {
				t: "text",
				text: a,
				style: s,
				w: t,
				h: n.scrollMin,
				full: c,
				scroll: !0
			}
		}), l;
	}
	array(e, t) {
		let n = this.theme;
		if (e.children.every((e) => b(e))) {
			let r = e.children.map(ce), i = r.map((e) => Math.ceil(this.metrics.value(e) + n.tagPad));
			if (r.every((e, n) => !e.includes("\n") && i[n] <= t)) {
				let a = oe(i, t, n.tagH, n.gap), o = e.children.map((e, t) => ({
					node: e,
					text: r[t],
					x: a[t].x,
					y: a[t].y,
					w: i[t]
				})), s = Math.max(...o.map((e) => e.x + e.w)), c = 1 + n.depthDiscount * (e.children.length - 1);
				return [{
					w: s,
					h: Math.max(n.rowH, a.h),
					s: c,
					v: {
						t: "tags",
						w: s,
						h: a.h,
						items: o
					}
				}];
			}
		}
		return this.rows(e, t, "none").map((e) => ({
			w: t,
			h: e.h,
			s: n.depthDiscount * e.s,
			stretch: e.stretch,
			v: {
				t: "list",
				rows: e
			}
		}));
	}
	tagWidths(e, t) {
		if (!e.children.every((e) => b(e))) return null;
		let n = this.theme, r = e.children.map(ce), i = r.map((e) => Math.ceil(this.metrics.value(e) + n.tagPad));
		return r.every((e, n) => !e.includes("\n") && i[n] <= t) ? i : null;
	}
	container(e, t, n = this.theme.frame.bar) {
		let r = this.snap(t);
		return this.cached(e, `c|${n}|${r}`, () => {
			let t = this.theme, i = r - 2 * t.pad;
			return b(e) || i < t.keyMin + 4 * t.unit ? [] : this.windowed(e, i).map((i) => {
				let a = 2 * n + 2 * t.pad + i.content.h;
				return {
					w: r,
					h: a,
					s: E * i.content.s,
					stretch: D(i.content),
					v: {
						t: "container",
						w: r,
						h: a,
						content: i.content,
						start: i.start,
						end: i.end,
						total: e.children.length
					}
				};
			});
		});
	}
	windowed(e, t) {
		let n = this.theme, r = e.children.length, i = this.windowOf(e), a = "end" in i, o = Math.max(0, Math.min(r - 1, a ? i.end : i.start)), s = [];
		for (let e = o; a ? e >= 0 : e < r; e += a ? -1 : 1) s.push(e);
		let c = [], l = this.tagWidths(e, t);
		if (l) {
			for (let r = 1; r <= s.length; r++) {
				let i = s.slice(0, r).sort((e, t) => e - t), a = oe(i.map((e) => l[e]), t, n.tagH, n.gap);
				if (a.h > ae) break;
				let o = i.map((t, n) => {
					let r = e.children[t];
					return {
						node: r,
						text: ce(r),
						x: a[n].x,
						y: a[n].y,
						w: l[t]
					};
				}), u = Math.max(...o.map((e) => e.x + e.w));
				c.push({
					start: i[0],
					end: i[r - 1],
					content: {
						w: u,
						h: Math.max(n.rowH, a.h),
						s: 1 + n.depthDiscount * (r - 1),
						v: {
							t: "tags",
							w: u,
							h: a.h,
							items: o
						}
					},
					rank: r
				});
			}
			return c;
		}
		let u = this.keyWidth(e), d = t - u - n.gap, f = [{
			h: 0,
			s: 0,
			data: null
		}], p = [];
		for (let [r, i] of s.entries()) {
			let a = e.children[i], o = this.prioritized(a) ? T : 0, s = a.depth > this.spec.limit && !o ? [] : this.childOptions(a, t, d);
			if (s.length === 0) break;
			let c = r === 0 ? ne : 1, l = Math.max(...s.map((e) => e.s)), m = [];
			for (let e of f) for (let t of s) {
				let r = {
					node: a,
					opt: t,
					full: t.s >= l - 1e-9
				};
				m.push({
					h: e.h + this.rowHeight(r) + n.gap,
					s: e.s + c * t.s + o,
					data: {
						row: r,
						prev: e.data
					}
				});
			}
			f = C(m, n.keep);
			for (let e of f) {
				let r = [];
				for (let t = e.data; t; t = t.prev) r.push(t.row);
				r.sort((e, t) => Number(e.node.label) - Number(t.node.label));
				let i = e.h - n.gap, a = r.reduce((e, t) => e + D(t.opt), 0), o = r.reduce((e, t) => e + (t.opt?.s ?? 0), 0), s = {
					width: this.snap(t),
					keyW: u,
					rows: r,
					collapsed: [],
					rowsH: i,
					chipsH: 0,
					h: i,
					s: o,
					stretch: a
				};
				p.push({
					h: i,
					s: e.s,
					data: {
						start: Number(r[0].node.label),
						end: Number(r[r.length - 1].node.label),
						content: {
							w: this.snap(t),
							h: i,
							s: n.depthDiscount * o,
							stretch: a,
							v: {
								t: "list",
								rows: s
							}
						},
						rank: e.s
					}
				});
			}
			if (r === 0 && (f = f.filter((e) => !!e.data?.row.full && D(e.data.row.opt) === 0)), f.length === 0 || f[0].h > ae) break;
		}
		return C(p, n.keep).map((e) => e.data);
	}
	frame(e, t) {
		let n = this.snap(t);
		return this.cached(e, `f|${n}`, () => {
			let t = this.theme, r = t.frame, i = n - r.side - 2 * t.pad;
			return i < t.keyMin + 4 * t.unit ? [] : this.rows(e, i, "chips").map((e) => {
				let i = r.bar + 2 * t.pad + e.h;
				return {
					w: n,
					h: i,
					s: 1 + t.depthDiscount * e.s,
					stretch: e.stretch,
					v: {
						t: "frame",
						w: n,
						h: i,
						rows: e
					}
				};
			});
		});
	}
	rowHeight(e) {
		return e.opt ? e.opt.layout === "block" ? e.opt.h : Math.max(this.theme.rowH, e.opt.h) : 0;
	}
	rows(e, t, n) {
		let r = this.snap(t);
		return this.cached(e, `r|${n}|${r}`, () => {
			let t = this.theme, i = this.keyWidth(e), a = r - i - t.gap, o = [{
				h: 0,
				s: 0,
				data: null
			}], s = e.children.length;
			return e.children.forEach((e, i) => {
				let c = 1e-6 * (s - i) / s, l = n === "sidebar" ? 0 : (this.chipWidth(e, r) + t.gap) * (t.chipH + t.gap) / Math.max(1, r), u = n === "none" ? [] : [{
					h: l,
					s: 0,
					data: {
						node: e,
						opt: null
					}
				}], d = this.prioritized(e) ? T : 0, f = e.depth > this.spec.limit && !d || n !== "none" && this.minifiedNode(e) ? [] : this.childOptions(e, r, a);
				for (let n of f) {
					let r = {
						node: e,
						opt: n
					};
					u.push({
						h: this.rowHeight(r) + t.gap,
						s: n.s + (n.s >= .5 ? c : 0) + d,
						data: r
					});
				}
				let p = [];
				for (let e of o) for (let t of u) p.push({
					h: e.h + t.h,
					s: e.s + t.s,
					data: {
						row: t.data,
						prev: e.data
					}
				});
				o = C(p, t.keep);
			}), o.length === 0 ? [] : C(o.map((e) => {
				let a = [];
				for (let t = e.data; t; t = t.prev) a.unshift(t.row);
				let o = a.filter((e) => e.opt), s = a.filter((e) => !e.opt).map((e) => e.node), c = o.reduce((e, t) => e + this.rowHeight(t), 0) + Math.max(0, o.length - 1) * t.gap, l = n === "chips" ? oe(s.map((e) => this.chipWidth(e, r)), r, t.chipH, t.gap).h : 0, u = c + (c && l ? t.gap : 0) + l, d = o.reduce((e, t) => e + D(t.opt), 0), f = {
					width: r,
					keyW: i,
					rows: a,
					collapsed: s,
					rowsH: c,
					chipsH: l,
					h: u,
					s: e.s,
					stretch: d
				};
				return {
					h: u,
					s: e.s,
					data: f
				};
			}), t.keep).map((e) => e.data);
		});
	}
}, fe = (e) => e.views?.[""] ?? "", pe = /* @__PURE__ */ new Set([
	"chip",
	"segment",
	"crumb",
	"title",
	"key"
]), O = /* @__PURE__ */ new Set([
	"chip",
	"segment",
	"crumb",
	"menu",
	"range",
	"pager"
]);
function me(e, t) {
	return e.marks.some((e) => e.ptr === t && !O.has(e.kind));
}
var he = (e) => ({
	ptr: e.ptr,
	text: e.label,
	type: e.kind
}), ge = class {
	tree;
	metrics;
	theme;
	measurer;
	offsets = {};
	scroll;
	constructor(e, t, n = x, r = []) {
		this.tree = e, this.metrics = t, this.theme = n, this.measurer = new de(t, n, r);
	}
	update(e, t) {
		return g(this.tree, e, t, (e) => this.measurer.forget(e));
	}
	plan(e, t) {
		let n = v(this.tree, fe(e)) ?? this.tree, r = { ...e.views };
		delete r[""], this.measurer.setSpec({
			limit: n.depth + this.theme.maxDepth,
			expanded: e.expanded ?? [],
			minified: e.minified ?? [],
			windows: e.windows ?? {},
			views: r
		}), this.offsets = e.offsets ?? {};
		let i = [];
		this.scroll = void 0, b(n) ? this.planUnframed(n, t, i) : n.kind === "object" ? this.planObject(n, t, i) : this.planArray(n, t, i);
		let a = this.scroll;
		return {
			focus: n.ptr,
			marks: i,
			width: t.w,
			height: t.h,
			overflow: a !== void 0,
			...a ? { scroll: a } : {}
		};
	}
	region(e, t, n, r) {
		if (!(r <= n.h + .5)) {
			for (let n = t; n < e.length; n++) e[n].scrolled = !0;
			this.scroll = {
				rect: n,
				height: r
			};
		}
	}
	planObject(e, t, n) {
		let r = this.theme, i = r.root, a = this.measurer, o = {
			kind: "frame",
			ptr: e.ptr,
			rect: {
				x: 0,
				y: 0,
				w: t.w,
				h: t.h
			},
			arch: "LTR",
			geom: i,
			depth: e.depth,
			type: e.kind,
			variant: "arch",
			outer: !0,
			targetable: !0,
			slot: ""
		};
		n.push(o), this.outerBar(e, i.side + i.inner, t.w - i.outer, i.bar, n);
		let s = i.side + r.pad, c = i.bar + r.pad, l = t.w - i.side - i.sideR - 2 * r.pad, u = t.h - i.bar - 2 * r.pad, { point: d } = ee(a.rows(e, l, "sidebar").map((e) => ({
			h: e.rowsH,
			s: e.s,
			data: e
		})), u), f = d.data, p = n.length;
		this.placeRows(f, s, c, [], e, n, Math.max(0, u - d.h)), this.region(n, p, {
			x: i.side,
			y: i.bar,
			w: t.w - i.side - i.sideR,
			h: t.h - i.bar
		}, d.h + 2 * r.pad), this.sidebar(e, f.collapsed, t.h, n);
	}
	sidebar(e, t, n, r) {
		let i = this.theme, a = i.root, o = a.bar + a.outer, s = i.segH + i.segGap, c = o, l = Math.max(0, Math.floor((n - o) / s)), u = 0;
		if (t.length > l) {
			let d = i.chipH + i.segGap;
			c = o + d, l = Math.max(1, Math.floor((n - c - d + i.segGap) / s));
			let f = Math.max(0, t.length - l);
			u = Math.min(f, Math.max(0, this.offsets[e.ptr] ?? 0));
			let p = (t, n, r, i) => ({
				kind: "pager",
				ptr: e.ptr,
				dir: t,
				disabled: r,
				set: { offset: i },
				type: e.kind,
				outer: !0,
				rect: {
					x: 0,
					y: n,
					w: a.side,
					h: d
				}
			});
			r.push(p("up", o, u === 0, Math.max(0, u - l)));
			let m = p("down", c + l * s, u >= f, Math.min(f, u + l));
			m.rect.h = Math.max(0, n - m.rect.y), r.push(m);
		}
		t.slice(u, u + l).forEach((e, t) => {
			r.push({
				kind: "segment",
				ptr: e.ptr,
				text: e.label,
				badge: se(e),
				type: e.kind,
				rect: {
					x: 0,
					y: c + t * s,
					w: a.side,
					h: s
				}
			});
		});
	}
	planArray(e, t, n) {
		let r = this.theme, i = r.root, a = Math.min(i.outer, i.bar), o = {
			kind: "frame",
			ptr: e.ptr,
			rect: {
				x: 0,
				y: 0,
				w: t.w,
				h: t.h
			},
			arch: "TB",
			geom: i,
			depth: e.depth,
			type: e.kind,
			variant: "container",
			outer: !0,
			targetable: !0,
			slot: ""
		};
		n.push(o), this.outerBar(e, a, t.w - a, i.bar, n);
		let s = Math.min(r.listMax, t.w - 2 * r.pad), c = Math.round((t.w - this.measurer.snap(s)) / 2), l = i.bar + r.pad, u = t.h - 2 * i.bar - 2 * r.pad, d = this.measurer.windowed(e, s).map((e) => ({
			h: e.content.h,
			s: e.rank,
			data: e
		}));
		if (d.length) {
			let { point: o } = ee(d, u), s = n.length, { start: f, end: p, content: m } = o.data, h = Math.max(0, u - o.h);
			this.placeValue(e, m, c, l, e, n, h), this.region(n, s, {
				x: 0,
				y: i.bar,
				w: t.w,
				h: t.h - 2 * i.bar
			}, o.h + 2 * r.pad), this.footer(e, f, p, this.nextStart(m, f, p, h), a, t.w - a, t.h - i.bar, i.bar, !0, n);
		}
	}
	nextStart(e, t, n, r) {
		if (e.v.t !== "list") return n + 1;
		let i = re(e.v.rows, r, (e) => this.measurer.prioritized(e));
		for (let n of e.v.rows.rows) {
			let e = Number(n.node.label);
			if (!(e <= t || !n.opt) && (n.full === !1 || (i.get(n) ?? 0) < D(n.opt))) return e;
		}
		return n + 1;
	}
	footer(e, t, n, r, i, a, o, s, c, l) {
		let u = this.theme, d = e.children.length, f = t > 0 || n < d - 1, p = this.arrowWidth(s), m = a;
		if (f) {
			let i = {
				kind: "pager",
				ptr: e.ptr,
				dir: "next",
				disabled: n >= d - 1,
				set: { window: { start: r } },
				type: e.kind,
				outer: c,
				rect: {
					x: a - p,
					y: o,
					w: p,
					h: s
				}
			}, f = {
				kind: "pager",
				ptr: e.ptr,
				dir: "prev",
				disabled: t <= 0,
				set: { window: { end: t - 1 } },
				type: e.kind,
				outer: c,
				rect: {
					x: a - 2 * p,
					y: o,
					w: p,
					h: s
				}
			};
			l.push(f, i), m = f.rect.x - u.gap;
		}
		let h = `${t + 1}\u2013${n + 1} of ${d}`, g = Math.ceil(this.metrics.key(h)) + 2 * u.pad, _ = Math.max(0, Math.min(g, m - i));
		l.push({
			kind: "range",
			ptr: e.ptr,
			text: h,
			start: t,
			end: n,
			total: d,
			rect: {
				x: m - _,
				y: o,
				w: _,
				h: s
			}
		});
	}
	planUnframed(e, t, n) {
		let r = this.theme, i = r.root, a = 2 * r.gap + r.pad, o = r.pad;
		e.parent && (n.push({
			kind: "frame",
			ptr: e.ptr,
			rect: {
				x: 0,
				y: 0,
				w: t.w,
				h: i.bar
			},
			arch: "T",
			geom: i,
			depth: e.depth,
			type: e.kind,
			variant: "bar",
			outer: !0,
			targetable: !1,
			slot: ""
		}), this.outerBar(e, i.bar / 2, t.w - i.bar / 2, i.bar, n), o = i.bar + 2 * r.pad);
		let s = t.h - o - r.pad, c = e.parent ? {
			x: 0,
			y: i.bar,
			w: t.w,
			h: t.h - i.bar
		} : {
			x: 0,
			y: 0,
			w: t.w,
			h: t.h
		}, l = n.length, u = this.measurer.variantsFor(e).every((e) => e.id.startsWith("core/"));
		if (e.kind === "string" && u) {
			let i = Math.min(r.measure, t.w - 2 * a), s = e.value, u = s.length > r.longText || s.includes("\n") ? "typeset" : "plain", d = Math.ceil(this.metrics.text(e.ptr, s, u).height(i));
			n.push({
				kind: "text",
				ptr: e.ptr,
				rect: {
					x: (t.w - i) / 2,
					y: o,
					w: i,
					h: d
				},
				text: s,
				style: u,
				scroll: !1,
				contentHeight: d
			}), this.region(n, l, c, o - c.y + d + r.pad);
			return;
		}
		let d = Math.min(e.kind === "array" ? r.listMax : r.measure, t.w - 2 * a), f = this.measurer.value(e, d).map((e) => ({
			h: e.h,
			s: e.s,
			data: e
		}));
		if (f.length === 0) return;
		let { point: p } = u ? ee(f, s) : { point: f.reduce((e, t) => t.s > e.s ? t : e) }, m = Math.round((t.w - this.measurer.snap(d)) / 2);
		this.placeValue(e, p.data, m, o, e, n), this.region(n, l, c, o - c.y + p.h + r.pad);
	}
	outerBar(e, t, n, r, i) {
		let a = this.theme, o = y(e), s = o.length ? r + a.segGap + a.gap : 0, c = this.arrowsWidth(e, "", r, n - t - s), l = this.title(e, t, n, r, s + c);
		i.push(l);
		let u = this.siblingArrows(e, "", l.rect.x - a.gap, 0, r, c, i);
		this.crumbs(o, t, u, 0, r, "", i);
	}
	arrowsWidth(e, t, n, r) {
		if (e.parent?.kind !== "array" || e.ptr === t) return 0;
		let i = 2 * this.arrowWidth(n) + this.theme.gap;
		return i <= r ? i : 0;
	}
	arrowWidth(e) {
		return Math.round(e * 1.5) + this.theme.segGap;
	}
	siblingArrows(e, t, n, r, i, a, o) {
		let s = e.parent;
		if (!a || !s) return n;
		let c = Number(e.label), l = this.arrowWidth(i), u = (e, n, a) => ({
			kind: "pager",
			ptr: s.ptr,
			dir: e,
			disabled: n < 0 || n >= s.children.length,
			set: {
				sibling: s.children[Math.max(0, Math.min(s.children.length - 1, n))].ptr,
				slot: t
			},
			type: s.kind,
			outer: t === "",
			rect: {
				x: a,
				y: r,
				w: l,
				h: i
			}
		});
		return o.push(u("prev", c - 1, n - 2 * l), u("next", c + 1, n - l)), n - a;
	}
	title(e, t, n, r, i) {
		let a = this.theme, o = Math.ceil(this.metrics.key(e.label) * a.titleScale) + 2 * a.pad, s = Math.max(0, Math.min(o, n - t - i));
		return {
			kind: "title",
			ptr: e.ptr,
			text: e.label,
			trail: [he(e)],
			scale: a.titleScale,
			outer: !0,
			slot: "",
			rect: {
				x: n - s,
				y: 0,
				w: s,
				h: r
			}
		};
	}
	crumbs(e, t, n, r, i, a, o) {
		if (e.length === 0) return;
		let s = this.theme, c = e.map((e) => Math.ceil(this.metrics.key(e.label)) + s.crumbPad + s.segGap), l = c.reduce((e, t) => e + t, 0), u = i + s.segGap, d = 0, f = t;
		if (l > n - t) {
			let s = n - t - u;
			for (d = e.length; d > 0 && c[d - 1] <= s;) s -= c[d - 1], d--;
			o.push({
				kind: "menu",
				ptr: e[0].ptr,
				rect: {
					x: f,
					y: r,
					w: u,
					h: i
				},
				slot: a,
				items: e.slice(0, d).map(he)
			}), f += u;
		}
		for (let t = d; t < e.length; t++) {
			let n = e[t];
			o.push({
				kind: "crumb",
				ptr: n.ptr,
				text: n.label,
				type: n.kind,
				slot: a,
				rect: {
					x: f,
					y: r,
					w: c[t],
					h: i
				}
			}), f += c[t];
		}
	}
	placeRows(e, t, n, r, i, a, o = 0) {
		let s = this.theme, c = this.measurer, l = e.rows.filter((e) => e.opt), u = re(e, o, (e) => c.prioritized(e)), d = n;
		if (l.forEach((n, r) => {
			let o = n.opt, f = u.get(n) ?? 0, p = r === 0 || r === l.length - 1 ? "LB" : "LT";
			o.v.t === "frame" ? this.placeFrame(n.node, o.v, t, d, p, i, a, f) : o.v.t === "slot" ? this.placeSlot(o.v, t, d, p, i, a, f) : o.v.t === "container" ? this.placeContainer(n.node, o.v, t, d, i, a, f) : o.layout === "block" ? this.placeValue(n.node, o, t, d, i, a, f) : (a.push({
				kind: "key",
				ptr: n.node.ptr,
				text: n.node.label,
				type: n.node.kind,
				rect: {
					x: t,
					y: d,
					w: e.keyW,
					h: c.rowHeight(n) + f
				}
			}), this.placeValue(n.node, o, t + e.keyW + s.gap, d, i, a, f)), d += c.rowHeight(n) + f + s.gap;
		}), r.length === 0) return;
		let f = [...u.values()].reduce((e, t) => e + t, 0), p = n + e.rowsH + f + (e.rowsH ? s.gap : 0), m = r.map((t) => c.chipWidth(t, e.width)), h = oe(m, e.width, s.chipH, s.gap);
		r.forEach((e, n) => {
			a.push({
				kind: "chip",
				ptr: e.ptr,
				text: e.label,
				badge: se(e),
				type: e.kind,
				rect: {
					x: t + h[n].x,
					y: p + h[n].y,
					w: m[n],
					h: s.chipH
				}
			});
		});
	}
	placeFrame(e, t, n, r, i, a, o, s = 0, c = e) {
		let l = this.theme, u = l.frame, d = t.h + s;
		o.push({
			kind: "frame",
			ptr: e.ptr,
			rect: {
				x: n,
				y: r,
				w: t.w,
				h: d
			},
			arch: i,
			geom: u,
			depth: e.depth,
			type: e.kind,
			variant: "frame",
			outer: !1,
			targetable: !0,
			slot: c.ptr
		});
		let f = i.endsWith("B"), p = f ? r + d - u.bar : r;
		this.navBar(e, a, n + t.w - u.bar / 2, t.w - u.bar / 2 - u.outer, p, u.bar, c, o);
		let m = n + u.side + l.pad, h = (f ? r : r + u.bar) + l.pad;
		this.placeRows(t.rows, m, h, t.rows.collapsed, e, o, s);
	}
	navBar(e, t, n, r, i, a, o, s) {
		let c = this.theme, l = [], u = [];
		for (let n = e; n && n !== t; n = n.parent) l.unshift(he(n)), n !== e && u.unshift(n);
		let d = u.length ? a + c.segGap + c.gap : 0, f = this.arrowsWidth(e, o.ptr, a, r - d), p = Math.ceil(this.metrics.key(e.label)) + 2 * c.pad, m = Math.max(0, Math.min(p, r - d - f)), h = {
			kind: "title",
			ptr: e.ptr,
			text: e.label,
			trail: l,
			scale: 1,
			outer: !1,
			slot: o.ptr,
			rect: {
				x: n - m,
				y: i,
				w: m,
				h: a
			}
		};
		s.push(h);
		let g = n - r, _ = this.siblingArrows(e, o.ptr, h.rect.x - c.gap, i, a, f, s);
		_ - g >= a + c.segGap && this.crumbs(u, g, _, i, a, o.ptr, s);
	}
	placeSlot(e, t, n, r, i, a, o = 0) {
		let s = this.theme, c = e.inner.v;
		if (c.t === "frame") return this.placeFrame(e.node, c, t, n, r, i, a, o, e.slot);
		if (c.t === "container") return this.placeContainer(e.node, c, t, n, i, a, o, e.slot);
		let l = s.frame;
		a.push({
			kind: "frame",
			ptr: e.node.ptr,
			rect: {
				x: t,
				y: n,
				w: e.w,
				h: l.bar
			},
			arch: "T",
			geom: l,
			depth: e.node.depth,
			type: e.node.kind,
			variant: "bar",
			outer: !1,
			targetable: !0,
			slot: e.slot.ptr
		}), this.navBar(e.node, i, t + e.w - l.bar / 2, e.w - l.bar, n, l.bar, e.slot, a), this.placeValue(e.node, e.inner, t + s.pad, n + l.bar + s.pad, i, a, o);
	}
	placeContainer(e, t, n, r, i, a, o = 0, s = e) {
		let c = this.theme, l = {
			...c.frame,
			side: 0
		}, u = Math.min(l.outer, l.bar), d = t.h + o;
		a.push({
			kind: "frame",
			ptr: e.ptr,
			rect: {
				x: n,
				y: r,
				w: t.w,
				h: d
			},
			arch: "TB",
			geom: l,
			depth: e.depth,
			type: e.kind,
			variant: "container",
			outer: !1,
			targetable: !0,
			slot: s.ptr
		}), this.navBar(e, i, n + t.w - u, t.w - 2 * u, r, l.bar, s, a), this.placeValue(e, t.content, n + c.pad, r + l.bar + c.pad, e, a, o);
		let f = this.nextStart(t.content, t.start, t.end, o);
		this.footer(e, t.start, t.end, f, n + u, n + t.w - u, r + d - l.bar, l.bar, !1, a);
	}
	placeValue(e, t, n, r, i, a, o = 0) {
		let s = this.theme, c = t.v;
		switch (c.t) {
			case "token":
				a.push({
					kind: "token",
					ptr: e.ptr,
					text: c.text,
					type: e.kind,
					rect: {
						x: n,
						y: r,
						w: c.w,
						h: s.rowH
					}
				});
				break;
			case "text": {
				let t = c.h + o;
				a.push({
					kind: "text",
					ptr: e.ptr,
					text: c.text,
					style: c.style,
					scroll: t < c.full,
					contentHeight: c.full,
					rect: {
						x: n,
						y: r,
						w: c.w,
						h: t
					}
				});
				break;
			}
			case "custom":
				a.push({
					kind: "custom",
					ptr: e.ptr,
					variant: c.variant,
					data: c.data,
					rect: {
						x: n,
						y: r,
						w: t.w,
						h: t.h + o
					}
				});
				break;
			case "tags":
				for (let e of c.items) a.push({
					kind: "tag",
					ptr: e.node.ptr,
					text: e.text,
					type: e.node.kind,
					rect: {
						x: n + e.x,
						y: r + e.y,
						w: e.w,
						h: s.tagH
					}
				});
				break;
			case "list":
				this.placeRows(c.rows, n, r, c.rows.collapsed, i, a, o);
				break;
			case "frame":
				this.placeFrame(e, c, n, r, "LT", i, a, o);
				break;
			case "container":
				this.placeContainer(e, c, n, r, i, a, o);
				break;
			case "slot": this.placeSlot(c, n, r, "LT", i, a, o);
		}
	}
};
//#endregion
//#region ../core/src/arch.ts
function _e(e, t, n) {
	let { bar: r, side: i, inner: a } = n, o = Math.min(n.outer, e / 2, t), s = r / 2;
	return [
		{
			t: "M",
			x: 0,
			y: t
		},
		{
			t: "L",
			x: 0,
			y: o
		},
		{
			t: "A",
			r: o,
			x: o,
			y: 0,
			sweep: 1
		},
		{
			t: "L",
			x: e - s,
			y: 0
		},
		{
			t: "A",
			r: s,
			x: e - s,
			y: r,
			sweep: 1
		},
		{
			t: "L",
			x: i + a,
			y: r
		},
		{
			t: "A",
			r: a,
			x: i,
			y: r + a,
			sweep: 0
		},
		{
			t: "L",
			x: i,
			y: t
		}
	];
}
function ve(e, t, n) {
	let { bar: r, side: i, inner: a } = n, o = n.sideR ?? n.side, s = Math.min(n.outer, e / 2, t);
	return [
		{
			t: "M",
			x: 0,
			y: t
		},
		{
			t: "L",
			x: 0,
			y: s
		},
		{
			t: "A",
			r: s,
			x: s,
			y: 0,
			sweep: 1
		},
		{
			t: "L",
			x: e - s,
			y: 0
		},
		{
			t: "A",
			r: s,
			x: e,
			y: s,
			sweep: 1
		},
		{
			t: "L",
			x: e,
			y: t
		},
		{
			t: "L",
			x: e - o,
			y: t
		},
		{
			t: "L",
			x: e - o,
			y: r + a
		},
		{
			t: "A",
			r: a,
			x: e - o - a,
			y: r,
			sweep: 0
		},
		{
			t: "L",
			x: i + a,
			y: r
		},
		{
			t: "A",
			r: a,
			x: i,
			y: r + a,
			sweep: 0
		},
		{
			t: "L",
			x: i,
			y: t
		}
	];
}
function ye(e, t) {
	let n = t.bar / 2;
	return [
		{
			t: "M",
			x: n,
			y: 0
		},
		{
			t: "L",
			x: e - n,
			y: 0
		},
		{
			t: "A",
			r: n,
			x: e - n,
			y: t.bar,
			sweep: 1
		},
		{
			t: "L",
			x: n,
			y: t.bar
		},
		{
			t: "A",
			r: n,
			x: n,
			y: 0,
			sweep: 1
		}
	];
}
function be(e, t, n) {
	let r = n.bar, i = Math.min(n.outer, r, e / 2);
	return [
		{
			t: "M",
			x: 0,
			y: r
		},
		{
			t: "L",
			x: 0,
			y: i
		},
		{
			t: "A",
			r: i,
			x: i,
			y: 0,
			sweep: 1
		},
		{
			t: "L",
			x: e - i,
			y: 0
		},
		{
			t: "A",
			r: i,
			x: e,
			y: i,
			sweep: 1
		},
		{
			t: "L",
			x: e,
			y: r
		},
		{
			t: "L",
			x: 0,
			y: r
		},
		{
			t: "M",
			x: 0,
			y: t - r
		},
		{
			t: "L",
			x: e,
			y: t - r
		},
		{
			t: "L",
			x: e,
			y: t - i
		},
		{
			t: "A",
			r: i,
			x: e - i,
			y: t,
			sweep: 1
		},
		{
			t: "L",
			x: i,
			y: t
		},
		{
			t: "A",
			r: i,
			x: 0,
			y: t - i,
			sweep: 1
		},
		{
			t: "L",
			x: 0,
			y: t - r
		}
	];
}
function xe(e, t, n, r, i) {
	let a = r !== i;
	return e.map((e) => {
		let o = r ? t - e.x : e.x, s = i ? n - e.y : e.y;
		return e.t === "A" ? {
			...e,
			x: o,
			y: s,
			sweep: a ? 1 - e.sweep : e.sweep
		} : {
			...e,
			x: o,
			y: s
		};
	});
}
var Se = (e) => Number(e.toFixed(2));
function k(e, t, n, r) {
	let i;
	switch (e) {
		case "LTR":
			i = ve(t, n, r);
			break;
		case "T":
			i = ye(t, r);
			break;
		case "TB":
			i = be(t, n, r);
			break;
		case "LT":
			i = _e(t, n, r);
			break;
		case "RT":
			i = xe(_e(t, n, r), t, n, !0, !1);
			break;
		case "LB":
			i = xe(_e(t, n, r), t, n, !1, !0);
			break;
		case "RB": i = xe(_e(t, n, r), t, n, !0, !0);
	}
	return i.map((e, t) => e.t === "A" ? `A${Se(e.r)},${Se(e.r)} 0 0 ${e.sweep} ${Se(e.x)},${Se(e.y)}` : `${e.t === "M" && t > 0 ? "Z " : ""}${e.t}${Se(e.x)},${Se(e.y)}`).join(" ") + " Z";
}
//#endregion
//#region ../markdown/src/detect.ts
function Ce(e) {
	let t = 0, n = 0;
	for (let r of e.split(/\r?\n/)) {
		let e = r.replace(/^ {0,3}/, "");
		if (e.startsWith("```") ? t++ : /^(#|-|\*)/.test(e) && n++, t >= 2 || n >= 3) return !0;
	}
	return /!?\[[^\]\n]*\]\([^)\s]+(\s+"[^"]*")?\)/.test(e);
}
//#endregion
//#region ../markdown/src/variant.ts
function A(e) {
	let t = e.priority ?? 10, n = e.scrollMin ?? 112;
	return {
		id: "markdown",
		layout: "value",
		match: (e) => e.kind === "string" && Ce(e.value) ? t : null,
		measure(t, r) {
			let i = t.value, a = Math.ceil(e.height(t.ptr, i, r)), o = Math.min(4, 1 + i.length / 400), s = (e, t, n, o = 0) => ({
				w: r,
				h: e,
				s: n,
				stretch: o,
				v: {
					t: "custom",
					variant: "markdown",
					data: {
						text: i,
						full: a,
						scroll: t
					}
				}
			}), c = [s(a, !1, o)];
			return a > n + 28 && c.push(s(n, !0, o * (.5 + .5 * n / a), a - n)), c;
		}
	};
}
//#endregion
//#region ../../node_modules/.pnpm/dompurify@3.4.17/node_modules/dompurify/dist/purify.es.mjs
function we(e, t) {
	this.v = e, this.k = t;
}
function j(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function Te(e) {
	if (Array.isArray(e)) return e;
}
function Ee(e, t) {
	var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (n != null) {
		var r, i, a, o, s = [], c = !0, l = !1;
		try {
			if (a = (n = n.call(e)).next, t === 0) {
				if (Object(n) !== n) return;
				c = !1;
			} else for (; !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); c = !0);
		} catch (e) {
			l = !0, i = e;
		} finally {
			try {
				if (!c && n.return != null && (o = n.return(), Object(o) !== o)) return;
			} finally {
				if (l) throw i;
			}
		}
		return s;
	}
}
function De() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function Oe(e, t) {
	return Te(e) || Ee(e, t) || ke(e, t) || De();
}
function ke(e, t) {
	if (e) {
		if (typeof e == "string") return j(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? j(e, t) : void 0;
	}
}
function Ae(e) {
	var t, n;
	function r(t, n) {
		try {
			var a = e[t](n), o = a.value, s = o instanceof we;
			Promise.resolve(s ? o.v : o).then(function(n) {
				if (s) {
					var c = t === "return" && o.k ? t : "next";
					if (!o.k || n.done) return r(c, n);
					n = e[c](n).value;
				}
				i(!!a.done, n);
			}, function(e) {
				r("throw", e);
			});
		} catch (e) {
			i(2, e);
		}
	}
	function i(e, i) {
		e === 2 ? t.reject(i) : t.resolve({
			value: i,
			done: e
		}), (t = t.next) ? r(t.key, t.arg) : n = null;
	}
	this._invoke = function(e, i) {
		return new Promise(function(a, o) {
			var s = {
				key: e,
				arg: i,
				resolve: a,
				reject: o,
				next: null
			};
			n ? n = n.next = s : (t = n = s, r(e, i));
		});
	}, typeof e.return != "function" && (this.return = void 0);
}
Ae.prototype[typeof Symbol == "function" && Symbol.asyncIterator || "@@asyncIterator"] = function() {
	return this;
}, Ae.prototype.next = function(e) {
	return this._invoke("next", e);
}, Ae.prototype.throw = function(e) {
	return this._invoke("throw", e);
}, Ae.prototype.return = function(e) {
	return this._invoke("return", e);
};
var je = Object.entries, Me = Object.setPrototypeOf, M = Object.isFrozen, Ne = Object.getPrototypeOf, Pe = Object.getOwnPropertyDescriptor, N = Object.freeze, P = Object.seal, Fe = Object.create, Ie = typeof Reflect < "u" && Reflect, Le = Ie.apply, Re = Ie.construct;
N ||= function(e) {
	return e;
}, P ||= function(e) {
	return e;
}, Le ||= function(e, t) {
	var n = [...arguments].slice(2);
	return e.apply(t, n);
}, Re ||= function(e) {
	return new e(...[...arguments].slice(1));
};
var ze = L(Array.prototype.forEach);
Array.prototype.indexOf;
var Be = L(Array.prototype.lastIndexOf), Ve = L(Array.prototype.pop), He = L(Array.prototype.push), Ue = L(Array.prototype.slice), We = L(Array.prototype.splice), Ge = Array.isArray, Ke = st(Set), qe = L(Set.prototype.add), Je = L(Set.prototype.has), Ye = L(String.prototype.toLowerCase), Xe = L(String.prototype.toString), Ze = L(String.prototype.match), Qe = L(String.prototype.replace), $e = L(String.prototype.indexOf), et = L(String.prototype.trim), tt = L(Number.prototype.toString), nt = L(Boolean.prototype.toString), rt = typeof BigInt > "u" ? null : L(BigInt.prototype.toString), it = typeof Symbol > "u" ? null : L(Symbol.prototype.toString), F = L(Object.prototype.hasOwnProperty), at = L(Object.prototype.toString), I = L(RegExp.prototype.test), ot = st(TypeError);
function L(e) {
	return function(t) {
		t instanceof RegExp && (t.lastIndex = 0);
		var n = [...arguments].slice(1);
		return Le(e, t, n);
	};
}
function st(e) {
	return function() {
		return Re(e, [...arguments]);
	};
}
function R(e, t) {
	let n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : Ye;
	if (Me && Me(e, null), !Ge(t)) return e;
	let r = t.length;
	for (; r--;) {
		let i = t[r];
		if (typeof i == "string") {
			let e = n(i);
			e !== i && (M(t) || (t[r] = e), i = e);
		}
		e[i] = !0;
	}
	return e;
}
function ct(e) {
	for (let t = 0; t < e.length; t++) F(e, t) || (e[t] = null);
	return e;
}
function z(e) {
	let t = Fe(null);
	for (let r of je(e)) {
		var n = Oe(r, 2);
		let i = n[0], a = n[1];
		F(e, i) && (t[i] = Ge(a) ? ct(a) : a && typeof a == "object" && a.constructor === Object ? z(a) : a);
	}
	return t;
}
function lt(e) {
	switch (typeof e) {
		case "string": return e;
		case "number": return tt(e);
		case "boolean": return nt(e);
		case "bigint": return rt ? rt(e) : "0";
		case "symbol": return it ? it(e) : "Symbol()";
		case "undefined": return at(e);
		case "function":
		case "object": {
			if (e === null) return at(e);
			let t = e, n = B(t, "toString");
			if (typeof n == "function") {
				let e = n(t);
				return typeof e == "string" ? e : at(e);
			}
			return at(e);
		}
		default: return at(e);
	}
}
function B(e, t) {
	for (; e !== null;) {
		let n = Pe(e, t);
		if (n) {
			if (n.get) return L(n.get);
			if (typeof n.value == "function") return L(n.value);
		}
		e = Ne(e);
	}
	function n() {
		return null;
	}
	return n;
}
function ut(e, t) {
	for (; e !== null;) {
		let n = Pe(e, t);
		if (n) return n.get ? L(n.get) : null;
		e = Ne(e);
	}
	return null;
}
function dt(e) {
	try {
		return I(e, ""), !0;
	} catch {
		return !1;
	}
}
var ft = N(/* @__PURE__ */ "a.abbr.acronym.address.area.article.aside.audio.b.bdi.bdo.big.blink.blockquote.body.br.button.canvas.caption.center.cite.code.col.colgroup.content.data.datalist.dd.decorator.del.details.dfn.dialog.dir.div.dl.dt.element.em.fieldset.figcaption.figure.font.footer.form.h1.h2.h3.h4.h5.h6.head.header.hgroup.hr.html.i.img.input.ins.kbd.label.legend.li.main.map.mark.marquee.menu.menuitem.meter.nav.nobr.ol.optgroup.option.output.p.picture.pre.progress.q.rp.rt.ruby.s.samp.search.section.select.shadow.slot.small.source.spacer.span.strike.strong.style.sub.summary.sup.table.tbody.td.template.textarea.tfoot.th.thead.time.tr.track.tt.u.ul.var.video.wbr".split(".")), pt = N(/* @__PURE__ */ "svg.a.altglyph.altglyphdef.altglyphitem.animatecolor.animatemotion.animatetransform.circle.clippath.defs.desc.ellipse.enterkeyhint.exportparts.filter.font.g.glyph.glyphref.hkern.image.inputmode.line.lineargradient.marker.mask.metadata.mpath.part.path.pattern.polygon.polyline.radialgradient.rect.stop.style.switch.symbol.text.textpath.title.tref.tspan.view.vkern".split(".")), mt = N([
	"feBlend",
	"feColorMatrix",
	"feComponentTransfer",
	"feComposite",
	"feConvolveMatrix",
	"feDiffuseLighting",
	"feDisplacementMap",
	"feDistantLight",
	"feDropShadow",
	"feFlood",
	"feFuncA",
	"feFuncB",
	"feFuncG",
	"feFuncR",
	"feGaussianBlur",
	"feImage",
	"feMerge",
	"feMergeNode",
	"feMorphology",
	"feOffset",
	"fePointLight",
	"feSpecularLighting",
	"feSpotLight",
	"feTile",
	"feTurbulence"
]), ht = N([
	"animate",
	"color-profile",
	"cursor",
	"discard",
	"font-face",
	"font-face-format",
	"font-face-name",
	"font-face-src",
	"font-face-uri",
	"foreignobject",
	"hatch",
	"hatchpath",
	"mesh",
	"meshgradient",
	"meshpatch",
	"meshrow",
	"missing-glyph",
	"script",
	"set",
	"solidcolor",
	"unknown",
	"use"
]), gt = N(/* @__PURE__ */ "math.menclose.merror.mfenced.mfrac.mglyph.mi.mlabeledtr.mmultiscripts.mn.mo.mover.mpadded.mphantom.mroot.mrow.ms.mspace.msqrt.mstyle.msub.msup.msubsup.mtable.mtd.mtext.mtr.munder.munderover.mprescripts".split(".")), _t = N([
	"maction",
	"maligngroup",
	"malignmark",
	"mlongdiv",
	"mscarries",
	"mscarry",
	"msgroup",
	"mstack",
	"msline",
	"msrow",
	"semantics",
	"annotation",
	"annotation-xml",
	"mprescripts",
	"none"
]), vt = N(["#text"]), yt = N(/* @__PURE__ */ "accept.action.align.alt.autocapitalize.autocomplete.autopictureinpicture.autoplay.background.bgcolor.border.capture.cellpadding.cellspacing.checked.cite.class.clear.color.cols.colspan.command.commandfor.controls.controlslist.coords.crossorigin.datetime.decoding.default.dir.disabled.disablepictureinpicture.disableremoteplayback.download.draggable.enctype.enterkeyhint.exportparts.face.for.headers.height.hidden.high.href.hreflang.id.inert.inputmode.integrity.ismap.kind.label.lang.list.loading.loop.low.max.maxlength.media.method.min.minlength.multiple.muted.name.nonce.noshade.novalidate.nowrap.open.optimum.part.pattern.placeholder.playsinline.popover.popovertarget.popovertargetaction.poster.preload.pubdate.radiogroup.readonly.rel.required.rev.reversed.role.rows.rowspan.spellcheck.scope.selected.shape.size.sizes.slot.span.srclang.start.src.srcset.step.style.summary.tabindex.title.translate.type.usemap.valign.value.width.wrap.xmlns".split(".")), bt = N(/* @__PURE__ */ "accent-height.accumulate.additive.alignment-baseline.amplitude.ascent.attributename.attributetype.azimuth.basefrequency.baseline-shift.begin.bias.by.class.clip.clippathunits.clip-path.clip-rule.color.color-interpolation.color-interpolation-filters.color-profile.color-rendering.cx.cy.d.dx.dy.diffuseconstant.direction.display.divisor.dominant-baseline.dur.edgemode.elevation.end.exponent.fill.fill-opacity.fill-rule.filter.filterunits.flood-color.flood-opacity.font-family.font-size.font-size-adjust.font-stretch.font-style.font-variant.font-weight.fx.fy.g1.g2.glyph-name.glyphref.gradientunits.gradienttransform.height.href.id.image-rendering.in.in2.intercept.k.k1.k2.k3.k4.kerning.keypoints.keysplines.keytimes.lang.lengthadjust.letter-spacing.kernelmatrix.kernelunitlength.lighting-color.local.marker-end.marker-mid.marker-start.markerheight.markerunits.markerwidth.maskcontentunits.maskunits.max.mask.mask-type.media.method.mode.min.name.numoctaves.offset.operator.opacity.order.orient.orientation.origin.overflow.paint-order.path.pathlength.patterncontentunits.patterntransform.patternunits.pointer-events.points.preservealpha.preserveaspectratio.primitiveunits.r.rx.ry.radius.refx.refy.repeatcount.repeatdur.restart.result.rotate.scale.seed.shape-rendering.slope.specularconstant.specularexponent.spreadmethod.startoffset.stddeviation.stitchtiles.stop-color.stop-opacity.stroke-dasharray.stroke-dashoffset.stroke-linecap.stroke-linejoin.stroke-miterlimit.stroke-opacity.stroke.stroke-width.style.surfacescale.systemlanguage.tabindex.tablevalues.targetx.targety.transform.transform-origin.text-anchor.text-decoration.text-orientation.text-rendering.textlength.type.u1.u2.unicode.values.vector-effect.viewbox.visibility.version.vert-adv-y.vert-origin-x.vert-origin-y.width.word-spacing.wrap.writing-mode.xchannelselector.ychannelselector.x.x1.x2.xmlns.y.y1.y2.z.zoomandpan".split(".")), xt = N(/* @__PURE__ */ "accent.accentunder.align.bevelled.close.columnalign.columnlines.columnspacing.columnspan.denomalign.depth.dir.display.displaystyle.encoding.fence.frame.height.href.id.largeop.length.linethickness.lquote.lspace.mathbackground.mathcolor.mathsize.mathvariant.maxsize.minsize.movablelimits.notation.numalign.open.rowalign.rowlines.rowspacing.rowspan.rspace.rquote.scriptlevel.scriptminsize.scriptsizemultiplier.selection.separator.separators.stretchy.subscriptshift.supscriptshift.symmetric.voffset.width.xmlns".split(".")), St = N([
	"xlink:href",
	"xml:id",
	"xlink:title",
	"xml:space",
	"xmlns:xlink"
]), Ct = P(/{{[\w\W]*|^[\w\W]*}}/g), wt = P(/<%[\w\W]*|^[\w\W]*%>/g), Tt = P(/\${[\w\W]*/g), Et = P(/^data-[\-\w.\u00B7-\uFFFF]+$/), Dt = P(/^aria-[\-\w]+$/), Ot = P(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i), kt = P(/^(?:\w+script|data):/i), At = P(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g), jt = P(/^html$/i), Mt = P(/^[a-z][.\w]*(-[.\w]+)+$/i), Nt = P(/<[/\w!]/g), Pt = P(/<[/\w]/g), Ft = P(/<\/no(script|embed|frames)/i), It = P(/\/>/i), V = {
	element: 1,
	attribute: 2,
	text: 3,
	cdataSection: 4,
	entityReference: 5,
	entityNode: 6,
	processingInstruction: 7,
	comment: 8,
	document: 9,
	documentType: 10,
	documentFragment: 11,
	notation: 12
}, Lt = N(R({}, [
	"style",
	"script",
	"xmp",
	"iframe",
	"noembed",
	"noframes",
	"plaintext",
	"noscript"
])), Rt = function() {
	return typeof window > "u" ? null : window;
}, zt = function(e, t) {
	if (typeof e != "object" || typeof e.createPolicy != "function") return null;
	let n = null, r = "data-tt-policy-suffix";
	t && t.hasAttribute(r) && (n = t.getAttribute(r));
	let i = "dompurify" + (n ? "#" + n : "");
	try {
		return e.createPolicy(i, {
			createHTML(e) {
				return e;
			},
			createScriptURL(e) {
				return e;
			}
		});
	} catch {
		return console.warn("TrustedTypes policy " + i + " could not be created."), null;
	}
}, Bt = function() {
	return {
		afterSanitizeAttributes: [],
		afterSanitizeElements: [],
		afterSanitizeShadowDOM: [],
		beforeSanitizeAttributes: [],
		beforeSanitizeElements: [],
		beforeSanitizeShadowDOM: [],
		uponSanitizeAttribute: [],
		uponSanitizeElement: [],
		uponSanitizeShadowNode: []
	};
}, Vt = function(e, t, n, r) {
	return F(e, t) && Ge(e[t]) ? R(r.base ? z(r.base) : {}, e[t], r.transform) : n;
}, Ht = function(e, t, n) {
	let r = F(e, t) ? e[t] : void 0;
	return r && typeof r == "object" ? z(r) : n();
};
function Ut() {
	let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : Rt(), t = (e) => Ut(e);
	if (t.version = "3.4.17", t.removed = [], !e || !e.document || e.document.nodeType !== V.document || !e.Element) return t.isSupported = !1, t;
	let n = e.document, r = n, i = r.currentScript;
	e.DocumentFragment;
	let a = e.HTMLTemplateElement, o = e.Node, s = e.Element, c = e.NodeFilter;
	e.NamedNodeMap === void 0 && (e.NamedNodeMap || e.MozNamedAttrMap), e.HTMLFormElement;
	let l = e.DOMParser, u = e.trustedTypes, d = s.prototype, f = B(d, "cloneNode"), p = B(d, "remove"), m = B(d, "removeAttributeNode"), h = B(d, "nextSibling"), g = B(d, "childNodes"), _ = B(d, "parentNode"), v = B(d, "shadowRoot"), y = B(d, "attributes"), b = o && o.prototype ? B(o.prototype, "nodeType") : null, x = o && o.prototype ? B(o.prototype, "nodeName") : null, S = o && o.prototype ? B(o.prototype, "ownerDocument") : null, C = function(e) {
		return b ? b(e) : e.nodeType;
	}, ee = function(e) {
		return x ? x(e) : e.nodeName;
	}, w = ut(d, "namespaceURI"), te = function(e) {
		return w ? w(e) : e.namespaceURI;
	};
	if (typeof a == "function") {
		let e = n.createElement("template");
		e.content && e.content.ownerDocument && (n = e.content.ownerDocument);
	}
	let T, E = "", ne, D = !1, re = 0, ie = function() {
		if (re > 0) throw ot("A configured TRUSTED_TYPES_POLICY callback (createHTML or createScriptURL) must not call DOMPurify.sanitize, as that causes infinite recursion. Do not pass a policy whose callbacks wrap DOMPurify as TRUSTED_TYPES_POLICY; see the \"DOMPurify and Trusted Types\" section of the README.");
	}, ae = function(e) {
		ie(), re++;
		try {
			return T.createHTML(e);
		} finally {
			re--;
		}
	}, oe = function(e) {
		ie(), re++;
		try {
			return T.createScriptURL(e);
		} finally {
			re--;
		}
	}, se = function() {
		return D ||= (ne = zt(u, i), !0), ne;
	}, ce = n, le = ce.implementation, ue = ce.createNodeIterator, de = ce.createDocumentFragment, fe = ce.getElementsByTagName, pe = r.importNode, O = Bt();
	t.isSupported = typeof je == "function" && typeof _ == "function" && le && le.createHTMLDocument !== void 0;
	let me = Ct, he = wt, ge = Tt, _e = Et, ve = Dt, ye = kt, be = At, xe = Mt, Se = Ot, k = null, Ce = R({}, [
		...ft,
		...pt,
		...mt,
		...gt,
		...vt
	]), A = null, we = R({}, [
		...yt,
		...bt,
		...xt,
		...St
	]), j = Object.seal(Fe(null, {
		tagNameCheck: {
			writable: !0,
			configurable: !1,
			enumerable: !0,
			value: null
		},
		attributeNameCheck: {
			writable: !0,
			configurable: !1,
			enumerable: !0,
			value: null
		},
		allowCustomizedBuiltInElements: {
			writable: !0,
			configurable: !1,
			enumerable: !0,
			value: !1
		}
	})), Te = null, Ee = null, De = Object.seal(Fe(null, {
		tagCheck: {
			writable: !0,
			configurable: !1,
			enumerable: !0,
			value: null
		},
		attributeCheck: {
			writable: !0,
			configurable: !1,
			enumerable: !0,
			value: null
		}
	})), Oe = !0, ke = !0, Ae = !1, Me = !0, M = !1, Ne = !0, Pe = !1, Ie = !1, Le = null, Re = null, tt = !1, nt = !1, rt = !1, it = !1, at = !0, L = !1, st = "user-content-", ct = !0, Wt = !1, Gt = null, Kt = {}, H = null, qt = R({}, /* @__PURE__ */ "annotation-xml.audio.colgroup.desc.foreignobject.head.iframe.math.mi.mn.mo.ms.mtext.noembed.noframes.noscript.plaintext.script.selectedcontent.style.svg.template.thead.title.video.xmp".split(".")), Jt = null, U = R({}, [
		"audio",
		"video",
		"img",
		"source",
		"image",
		"track"
	]), Yt = null, Xt = R({}, [
		"alt",
		"class",
		"for",
		"id",
		"label",
		"name",
		"pattern",
		"placeholder",
		"role",
		"summary",
		"title",
		"value",
		"style",
		"xmlns"
	]), Zt = "http://www.w3.org/1998/Math/MathML", Qt = "http://www.w3.org/2000/svg", W = "http://www.w3.org/1999/xhtml", $t = W, en = !1, tn = null, nn = R({}, [
		Zt,
		Qt,
		W
	], Xe), rn = N([
		"mi",
		"mo",
		"mn",
		"ms",
		"mtext"
	]), an = R({}, rn), on = N(["annotation-xml"]), sn = R({}, on), cn = R({}, [
		"title",
		"style",
		"font",
		"a",
		"script"
	]), ln = null, un = ["application/xhtml+xml", "text/html"], G = null, dn = null, fn = n.createElement("form"), pn = function(e) {
		return e instanceof RegExp || e instanceof Function;
	}, mn = function() {
		let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
		if (dn && dn === e) return;
		(!e || typeof e != "object") && (e = {}), e = z(e), ln = un.indexOf(e.PARSER_MEDIA_TYPE) === -1 ? "text/html" : e.PARSER_MEDIA_TYPE, G = ln === "application/xhtml+xml" ? Xe : Ye, k = Vt(e, "ALLOWED_TAGS", Ce, { transform: G }), A = Vt(e, "ALLOWED_ATTR", we, { transform: G }), tn = Vt(e, "ALLOWED_NAMESPACES", nn, { transform: Xe }), Yt = Vt(e, "ADD_URI_SAFE_ATTR", Xt, {
			transform: G,
			base: Xt
		}), Jt = Vt(e, "ADD_DATA_URI_TAGS", U, {
			transform: G,
			base: U
		}), H = Vt(e, "FORBID_CONTENTS", qt, { transform: G }), Te = Vt(e, "FORBID_TAGS", z({}), { transform: G }), Ee = Vt(e, "FORBID_ATTR", z({}), { transform: G }), Kt = F(e, "USE_PROFILES") ? e.USE_PROFILES && typeof e.USE_PROFILES == "object" ? z(e.USE_PROFILES) : e.USE_PROFILES : !1, Oe = e.ALLOW_ARIA_ATTR !== !1, ke = e.ALLOW_DATA_ATTR !== !1, Ae = e.ALLOW_UNKNOWN_PROTOCOLS || !1, Me = e.ALLOW_SELF_CLOSE_IN_ATTR !== !1, M = e.SAFE_FOR_TEMPLATES || !1, Ne = e.SAFE_FOR_XML !== !1, Pe = e.WHOLE_DOCUMENT || !1, nt = e.RETURN_DOM || !1, rt = e.RETURN_DOM_FRAGMENT || !1, it = e.RETURN_TRUSTED_TYPE || !1, tt = e.FORCE_BODY || !1, at = e.SANITIZE_DOM !== !1, L = e.SANITIZE_NAMED_PROPS || !1, ct = e.KEEP_CONTENT !== !1, Wt = e.IN_PLACE || !1, Se = dt(e.ALLOWED_URI_REGEXP) ? e.ALLOWED_URI_REGEXP : Ot, $t = typeof e.NAMESPACE == "string" ? e.NAMESPACE : W, an = Ht(e, "MATHML_TEXT_INTEGRATION_POINTS", () => R({}, rn)), sn = Ht(e, "HTML_INTEGRATION_POINTS", () => R({}, on));
		let t = Ht(e, "CUSTOM_ELEMENT_HANDLING", () => Fe(null));
		if (j = Fe(null), F(t, "tagNameCheck") && pn(t.tagNameCheck) && (j.tagNameCheck = t.tagNameCheck), F(t, "attributeNameCheck") && pn(t.attributeNameCheck) && (j.attributeNameCheck = t.attributeNameCheck), F(t, "allowCustomizedBuiltInElements") && typeof t.allowCustomizedBuiltInElements == "boolean" && (j.allowCustomizedBuiltInElements = t.allowCustomizedBuiltInElements), P(j), M && (ke = !1), rt && (nt = !0), Kt && (k = R({}, vt), A = Fe(null), Kt.html === !0 && (R(k, ft), R(A, yt)), Kt.svg === !0 && (R(k, pt), R(A, bt), R(A, St)), Kt.svgFilters === !0 && (R(k, mt), R(A, bt), R(A, St)), Kt.mathMl === !0 && (R(k, gt), R(A, xt), R(A, St))), De.tagCheck = null, De.attributeCheck = null, F(e, "ADD_TAGS") && (typeof e.ADD_TAGS == "function" ? De.tagCheck = e.ADD_TAGS : Ge(e.ADD_TAGS) && (k === Ce && (k = z(k)), R(k, e.ADD_TAGS, G))), F(e, "ADD_ATTR") && (typeof e.ADD_ATTR == "function" ? De.attributeCheck = e.ADD_ATTR : Ge(e.ADD_ATTR) && (A === we && (A = z(A)), R(A, e.ADD_ATTR, G))), F(e, "ADD_FORBID_CONTENTS") && Ge(e.ADD_FORBID_CONTENTS) && (H === qt && (H = z(H)), R(H, e.ADD_FORBID_CONTENTS, G)), ct && (k["#text"] = !0), Pe && R(k, [
			"html",
			"head",
			"body"
		]), k.table && (R(k, ["tbody"]), delete Te.tbody), e.TRUSTED_TYPES_POLICY) {
			if (typeof e.TRUSTED_TYPES_POLICY.createHTML != "function") throw ot("TRUSTED_TYPES_POLICY configuration option must provide a \"createHTML\" hook.");
			if (typeof e.TRUSTED_TYPES_POLICY.createScriptURL != "function") throw ot("TRUSTED_TYPES_POLICY configuration option must provide a \"createScriptURL\" hook.");
			let t = T;
			T = e.TRUSTED_TYPES_POLICY;
			try {
				E = ae("");
			} catch (e) {
				throw T = t, e;
			}
		} else e.TRUSTED_TYPES_POLICY === null ? (T = void 0, E = "") : (T === void 0 && (T = se()), T && typeof E == "string" && (E = ae("")));
		N && N(e), dn = e;
	}, hn = R({}, [
		...pt,
		...mt,
		...ht
	]), gn = R({}, [...gt, ..._t]), _n = function(e, t, n) {
		return t.namespaceURI === W ? e === "svg" : t.namespaceURI === Zt ? e === "svg" && (n === "annotation-xml" || an[n]) : !!hn[e];
	}, vn = function(e, t, n) {
		return t.namespaceURI === W ? e === "math" : t.namespaceURI === Qt ? e === "math" && sn[n] : !!gn[e];
	}, K = function(e, t, n) {
		return t.namespaceURI === Qt && !sn[n] || t.namespaceURI === Zt && !an[n] ? !1 : !gn[e] && (cn[e] || !hn[e]);
	}, yn = function(e) {
		let t = te(e), n = Ye(ee(e)), r = _(e), i, a;
		return r && C(r) === V.element ? (i = { namespaceURI: te(r) }, a = Ye(ee(r))) : (i = { namespaceURI: $t }, a = "template"), tn[t] ? t === Qt ? _n(n, i, a) : t === Zt ? vn(n, i, a) : t === W ? K(n, i, a) : !!(ln === "application/xhtml+xml" && tn[t]) : !1;
	}, bn = function(e) {
		He(t.removed, { element: e });
		try {
			_(e).removeChild(e);
		} catch {
			if (p(e), !_(e)) throw ot("a node selected for removal could not be detached from its tree and cannot be safely returned; refusing to sanitize in place");
		}
	}, q = function(e, t, n) {
		try {
			m(e, t);
		} catch {
			try {
				e.removeAttribute(n);
			} catch {}
		}
	}, J = function(e) {
		wn(e);
		let t = g(e);
		t && ze(Ue(t), (e) => {
			try {
				p(e);
			} catch {}
		});
		let n = C(e) === V.element ? y(e) : null;
		if (n) for (let t = n.length - 1; t >= 0; --t) {
			let r = n[t], i = r && r.name;
			typeof i == "string" && q(e, r, i);
		}
	}, xn = function(e, n, r) {
		if (!r) try {
			r = n.getAttributeNode(e);
		} catch {
			r = null;
		}
		He(t.removed, {
			attribute: r || null,
			from: n
		});
		try {
			r ? m(n, r) : n.removeAttribute(e);
		} catch {
			try {
				n.removeAttribute(e);
			} catch {}
		}
		if (e === "is") {
			if (nt || rt) try {
				bn(n);
			} catch {}
			else try {
				n.setAttribute(e, "");
			} catch {}
		}
	}, Sn = function(e) {
		let t = y(e);
		if (t) for (let n = t.length - 1; n >= 0; --n) {
			let r = t[n], i = r && r.name;
			typeof i != "string" || A[G(i)] || q(e, r, i);
		}
	}, Cn = function(e, t) {
		let n = arguments.length > 2 && arguments[2] !== void 0 && arguments[2], r = [e];
		for (; r.length > 0;) {
			let e = r.pop();
			if (t(e) === !1) continue;
			if (n && C(e) === V.element) {
				let t = v(e);
				Y(t) && r.push(t);
			}
			let i = g(e);
			if (i) for (let e = i.length - 1; e >= 0; --e) r.push(i[e]);
		}
	}, wn = function(e) {
		Cn(e, (e) => {
			C(e) === V.element && Sn(e);
		});
	}, Tn = function(e) {
		let t = [];
		return Cn(e, (e) => {
			t.push(e);
		}, !0), t;
	}, En = function(e, t) {
		let n = Ke();
		ze(Tn(e), (e) => {
			C(e) === V.element && qe(n, e);
		}), ze(t, (e) => {
			C(e) === V.element && !Je(n, e) && Sn(e);
		});
	}, Dn = function(e, n) {
		let r = !1;
		return ze(t.removed, (t) => {
			t.element && (r ||= t.element === e, wn(t.element));
		}), En(e, n), r;
	}, On = function(e, t) {
		let n = Gt, r = null, i = () => (r || (r = Ke(), ze(t, (e) => {
			qe(r, e);
		})), r);
		for (let t = 0;; t++) {
			let r = Tn(e), a = [e], o = !1;
			if (ze(r, (e) => {
				C(e) === V.documentFragment ? He(a, e) : !o && !Je(n, e) && (o = Je(i(), e));
			}), !o) return;
			if (t >= 8) throw ot("the tree kept changing during in-place sanitization; refusing to return it");
			ze(a, (t, n) => {
				kn(t, n > 0, e, i());
			});
		}
	}, kn = function(e, t, n, r) {
		let i = Pn(e), a;
		for (; a = i.nextNode();) Je(r, a) && !Je(Gt, a) && (t && X(O.uponSanitizeShadowNode, a, null), Gn(a, n), Zn(a, n), Y(a.content) && Qn(a.content));
	}, An = function(e) {
		Gt && qe(Gt, e);
	}, jn = function(e, t) {
		return Ne ? e === "patchsrc" || e === "for" && t !== "label" && t !== "output" : !1;
	}, Mn = function(e) {
		Ne && Cn(e, (e) => {
			let t = C(e);
			if (t === V.processingInstruction || t === V.comment && I(Pt, e.data)) {
				try {
					p(e);
				} catch {}
				return !1;
			}
			if (t === V.element) {
				let t = e, n = G(ee(e));
				try {
					t.hasAttribute && t.hasAttribute("patchsrc") && t.removeAttribute("patchsrc"), t.hasAttribute && t.hasAttribute("for") && jn("for", n) && t.removeAttribute("for");
				} catch {}
			}
			return !0;
		});
	}, Nn = function(e) {
		let t = null, r = null;
		if (tt) e = "<remove></remove>" + e;
		else {
			let t = Ze(e, /^[\r\n\t ]+/);
			r = t && t[0];
		}
		ln === "application/xhtml+xml" && $t === W && (e = "<html xmlns=\"http://www.w3.org/1999/xhtml\"><head></head><body>" + e + "</body></html>");
		let i = T ? ae(e) : e;
		if ($t === W) try {
			t = new l().parseFromString(i, ln);
		} catch {}
		if (!t || !t.documentElement) {
			t = le.createDocument($t, "template", null);
			try {
				t.documentElement.innerHTML = en ? E : i;
			} catch {}
		}
		let a = t.body || t.documentElement;
		return e && r && a.insertBefore(n.createTextNode(r), a.childNodes[0] || null), $t === W ? fe.call(t, Pe ? "html" : "body")[0] : Pe ? t.documentElement : a;
	}, Pn = function(e) {
		let t = S ? S(e) : e.ownerDocument;
		return ue.call(t || e, e, c.SHOW_ELEMENT | c.SHOW_COMMENT | c.SHOW_TEXT | c.SHOW_PROCESSING_INSTRUCTION | c.SHOW_CDATA_SECTION, null);
	}, Fn = function(e) {
		return e = Qe(e, me, " "), e = Qe(e, he, " "), e = Qe(e, ge, " "), e;
	}, In = function(e) {
		Ln(e);
		let t = e.querySelectorAll?.call(e, "template");
		t && ze(t, (e) => {
			Y(e.content) && In(e.content);
		});
	}, Ln = function(e) {
		e.normalize();
		let t = S ? S(e) : e.ownerDocument, n = ue.call(t || e, e, c.SHOW_TEXT | c.SHOW_COMMENT | c.SHOW_CDATA_SECTION | c.SHOW_PROCESSING_INSTRUCTION, null), r = n.nextNode();
		for (; r;) r.data = Fn(r.data), r = n.nextNode();
	}, Rn = function(e) {
		let t = x ? x(e) : null;
		return typeof t != "string" || G(t) !== "form" ? !1 : typeof e.nodeName != "string" || typeof e.textContent != "string" || typeof e.removeChild != "function" || e.attributes !== y(e) || typeof e.removeAttribute != "function" || typeof e.removeAttributeNode != "function" || typeof e.getAttributeNode != "function" || typeof e.setAttribute != "function" || typeof e.namespaceURI != "string" || typeof e.insertBefore != "function" || typeof e.hasChildNodes != "function" || e.nodeType !== b(e) || e.childNodes !== g(e);
	}, Y = function(e) {
		if (!b || typeof e != "object" || !e) return !1;
		try {
			return b(e) === V.documentFragment;
		} catch {
			return !1;
		}
	}, zn = function(e) {
		if (!b || typeof e != "object" || !e) return !1;
		try {
			return typeof b(e) == "number";
		} catch {
			return !1;
		}
	};
	function X(e, n, r) {
		e.length !== 0 && ze(e, (e) => {
			e.call(t, n, r, dn);
		});
	}
	let Bn = function(e, t) {
		return !!(Ne && e.hasChildNodes() && !zn(e.firstElementChild) && I(Nt, e.textContent) && I(Nt, e.innerHTML) || Ne && Lt[t] && C(e) === V.element && te(e) === W && (zn(e.firstElementChild) || typeof e.textContent == "string" && I(Nt, e.textContent)) || e.nodeType === V.processingInstruction || Ne && e.nodeType === V.comment && I(Pt, e.data));
	}, Vn = function(e, t) {
		return e instanceof RegExp ? I(e, t) : e instanceof Function && !!e(t, ...[...arguments].slice(2));
	}, Hn = function(e, t, n) {
		if (!Te[t] && qn(t) && Vn(j.tagNameCheck, t)) return !1;
		if (ct && !H[t] && !H[Ye(t)]) {
			let t = _(e), r = g(e);
			if (r && t) {
				let i = r.length;
				for (let a = i - 1; a >= 0; --a) {
					let i = e === n ? f(r[a], !0) : r[a];
					t.insertBefore(i, h(e));
				}
			}
		}
		return bn(e), !0;
	}, Un = function(e, t, n, r) {
		return e.length === 0 ? t : t === n || t === r ? z(t) : t;
	}, Wn = function(e, t) {
		return e === t || _(e) !== null ? !1 : (Wt && wn(e), !0);
	}, Gn = function(e, n) {
		if (An(e), X(O.beforeSanitizeElements, e, null), Wn(e, n)) return !0;
		if (Rn(e)) return bn(e), !0;
		let r = G(ee(e));
		if (k = Un(O.uponSanitizeElement, k, Ce, Le), X(O.uponSanitizeElement, e, {
			tagName: r,
			allowedTags: k
		}), Wn(e, n)) return !0;
		if (Bn(e, r)) return bn(e), !0;
		if (Te[r] || !(De.tagCheck instanceof Function && De.tagCheck(r)) && !k[r]) {
			let t = Hn(e, r, n);
			return t === !1 && (X(O.afterSanitizeElements, e, null), Wn(e, n)) ? !0 : t;
		}
		if (C(e) === V.element && !yn(e) || (r === "noscript" || r === "noembed" || r === "noframes") && I(Ft, e.innerHTML)) return bn(e), !0;
		if (M && e.nodeType === V.text) {
			let n = Fn(e.textContent);
			e.textContent !== n && (He(t.removed, { element: e.cloneNode() }), e.textContent = n);
		}
		return X(O.afterSanitizeElements, e, null), Wn(e, n);
	}, Z = function(e, t, r) {
		if (Ee[t] || jn(t, e) || at && (t === "id" || t === "name") && (r in n || r in fn)) return !1;
		let i = A[t] || De.attributeCheck instanceof Function && De.attributeCheck(t, e);
		return ke && I(_e, t) || Oe && I(ve, t) ? !0 : i ? Yt[t] || I(Se, Qe(r, be, "")) || (t === "src" || t === "xlink:href" || t === "href") && e !== "script" && $e(r, "data:") === 0 && Jt[e] || Ae && !I(ye, Qe(r, be, "")) ? !0 : !r : qn(e) && Vn(j.tagNameCheck, e) && Vn(j.attributeNameCheck, t, e) || t === "is" && j.allowCustomizedBuiltInElements && Vn(j.tagNameCheck, r);
	}, Kn = R({}, [
		"annotation-xml",
		"color-profile",
		"font-face",
		"font-face-format",
		"font-face-name",
		"font-face-src",
		"font-face-uri",
		"missing-glyph"
	]), qn = function(e) {
		return !Kn[Ye(e)] && I(xe, e);
	}, Jn = function(e, t, n, r) {
		if (T && typeof u == "object" && typeof u.getAttributeType == "function" && !n) switch (u.getAttributeType(e, t)) {
			case "TrustedHTML": return ae(r);
			case "TrustedScriptURL": return oe(r);
		}
		return r;
	}, Yn = function(e, t, n, r) {
		try {
			return n ? e.setAttributeNS(n, t, r) : e.setAttribute(t, r), !Rn(e) || (bn(e), !1);
		} catch {
			return xn(t, e), !1;
		}
	}, Xn = function(e, t) {
		return Ne && I(/((--!?|])>)|<\/(style|script|title|xmp|textarea|noscript|iframe|noembed|noframes)/i, t) ? !0 : Ye(e) === "attributename" && Ze(t, "href") !== null;
	}, Zn = function(e, n) {
		if (X(O.beforeSanitizeAttributes, e, null), Wn(e, n)) return;
		let r = e.attributes;
		if (!r || Rn(e)) return;
		A = Un(O.uponSanitizeAttribute, A, we, Re);
		let i = {
			attrName: "",
			attrValue: "",
			keepAttr: !0,
			allowedAttributes: A,
			forceKeepAttr: void 0
		}, a = r.length, o = G(e.nodeName);
		for (; a--;) {
			let n = r[a], s = n.name, c = n.namespaceURI, l = n.value, u = G(s), d = l, f = s === "value" ? d : et(d), p = !1;
			i.attrName = u, i.attrValue = f, i.keepAttr = !0, i.forceKeepAttr = void 0, X(O.uponSanitizeAttribute, e, i), f = i.attrValue, L && (u === "id" || u === "name") && $e(f, st) !== 0 && (xn(s, e, n), f = st + f, p = !0), Xn(s, f) ? xn(s, e, n) : i.forceKeepAttr || (i.keepAttr ? !Me && I(It, f) ? xn(s, e, n) : (M && (f = Fn(f)), Z(o, u, f) ? (f = Jn(o, u, c, f), f !== d && Yn(e, s, c, f) && p && Ve(t.removed)) : xn(s, e, n)) : xn(s, e, n));
		}
		X(O.afterSanitizeAttributes, e, null), Wn(e, n);
	}, Qn = function(e) {
		let t = null, n = Pn(e);
		for (X(O.beforeSanitizeShadowDOM, e, null); t = n.nextNode();) if (X(O.uponSanitizeShadowNode, t, null), Gn(t, e), Zn(t, e), Y(t.content) && Qn(t.content), C(t) === V.element) {
			let e = v(t);
			Y(e) && ($n(e), Qn(e));
		}
		M && Ln(e), X(O.afterSanitizeShadowDOM, e, null);
	}, $n = function(e) {
		let t = [{
			node: e,
			shadow: null
		}];
		for (; t.length > 0;) {
			let e = t.pop();
			if (e.shadow) {
				Qn(e.shadow);
				continue;
			}
			let n = e.node, r = C(n) === V.element, i = g(n);
			if (i) for (let e = i.length - 1; e >= 0; --e) t.push({
				node: i[e],
				shadow: null
			});
			if (r) {
				let e = x ? x(n) : null;
				if (typeof e == "string" && G(e) === "template") {
					let e = n.content;
					Y(e) && t.push({
						node: e,
						shadow: null
					});
				}
			}
			if (r) {
				let e = v(n);
				Y(e) && t.push({
					node: null,
					shadow: e
				}, {
					node: e,
					shadow: null
				});
			}
		}
	};
	return t.sanitize = function(e) {
		let n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, i = null, a = null, o = null, s = null;
		if (en = !e, en && (e = "<!-->"), typeof e != "string" && !zn(e) && (e = lt(e), typeof e != "string")) throw ot("dirty is not a string, aborting");
		if (!t.isSupported) return e;
		Ie ? (k = Le, A = Re) : mn(n), (O.uponSanitizeElement.length > 0 || O.uponSanitizeAttribute.length > 0) && (k = z(k)), O.uponSanitizeAttribute.length > 0 && (A = z(A)), t.removed = [];
		let c = Wt && typeof e != "string" && zn(e), l = [], u = Gt;
		if (c) {
			Mn(e);
			let t = ee(e);
			if (typeof t == "string") {
				let n = G(t);
				if (!k[n] || Te[n]) throw J(e), ot("root node is forbidden and cannot be sanitized in-place");
			}
			if (Rn(e)) throw J(e), ot("root node is clobbered and cannot be sanitized in-place");
			l = Tn(e), Gt = Ke();
		} else if (zn(e)) i = Nn("<!---->"), a = i.ownerDocument.importNode(e, !0), a.nodeType === V.element && a.nodeName === "BODY" || a.nodeName === "HTML" ? i = a : i.appendChild(a), $n(i);
		else {
			if (!nt && !M && !Pe && e.indexOf("<") === -1) return T && it ? ae(e) : e;
			if (i = Nn(e), !i) return nt ? null : it ? E : "";
		}
		i && tt && bn(i.firstChild);
		let d = c ? e : i;
		try {
			c && $n(e);
			let t = Pn(d);
			for (; o = t.nextNode();) Gn(o, d), Zn(o, d), Y(o.content) && Qn(o.content);
			c && On(e, l);
		} catch (t) {
			throw c && (J(e), Dn(e, l)), t;
		} finally {
			Gt = u;
		}
		if (c) {
			if (Dn(e, l)) throw ot("a node selected for removal could not be safely returned; refusing to sanitize in place");
			return M && In(e), e;
		}
		if (nt) {
			if (M && In(i), rt) for (s = de.call(i.ownerDocument); i.firstChild;) s.appendChild(i.firstChild);
			else s = i;
			return (A.shadowroot || A.shadowrootmode) && (s = pe.call(r, s, !0)), s;
		}
		let f = Pe ? i.outerHTML : i.innerHTML;
		return Pe && k["!doctype"] && i.ownerDocument && i.ownerDocument.doctype && i.ownerDocument.doctype.name && I(jt, i.ownerDocument.doctype.name) && (f = "<!DOCTYPE " + i.ownerDocument.doctype.name + ">\n" + f), M && (f = Fn(f)), T && it ? ae(f) : f;
	}, t.setConfig = function() {
		let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
		mn(e), Ie = !0, Le = k, Re = A;
	}, t.clearConfig = function() {
		dn = null, Ie = !1, Le = null, Re = null, T = ne, E = "";
	}, t.isValidAttribute = function(e, t, n) {
		dn || mn({});
		let r = G(e), i = G(t);
		return typeof n == "string" && (Xn(t, n) || !Me && I(It, n)) ? !1 : Z(r, i, n);
	}, t.addHook = function(e, t) {
		typeof t == "function" && F(O, e) && He(O[e], t);
	}, t.removeHook = function(e, t) {
		if (F(O, e)) {
			if (t !== void 0) {
				let n = Be(O[e], t);
				return n === -1 ? void 0 : We(O[e], n, 1)[0];
			}
			return Ve(O[e]);
		}
	}, t.removeHooks = function(e) {
		F(O, e) && (O[e] = []);
	}, t.removeAllHooks = function() {
		O = Bt();
	}, t;
}
var Wt = Ut(), Gt = {};
function Kt(e) {
	let t = Gt[e];
	if (t) return t;
	t = Gt[e] = [];
	for (let e = 0; e < 128; e++) {
		let n = String.fromCharCode(e);
		t.push(n);
	}
	for (let n = 0; n < e.length; n++) {
		let r = e.charCodeAt(n);
		t[r] = "%" + ("0" + r.toString(16).toUpperCase()).slice(-2);
	}
	return t;
}
function H(e, t) {
	typeof t != "string" && (t = H.defaultChars);
	let n = Kt(t);
	return e.replace(/(%[a-f0-9]{2})+/gi, function(e) {
		let t = "";
		for (let r = 0, i = e.length; r < i; r += 3) {
			let a = parseInt(e.slice(r + 1, r + 3), 16);
			if (a < 128) t += n[a];
			else {
				if ((a & 224) == 192 && r + 3 < i) {
					let n = parseInt(e.slice(r + 4, r + 6), 16);
					if ((n & 192) == 128) {
						let e = a << 6 & 1984 | n & 63;
						t += e < 128 ? "��" : String.fromCharCode(e), r += 3;
						continue;
					}
				}
				if ((a & 240) == 224 && r + 6 < i) {
					let n = parseInt(e.slice(r + 4, r + 6), 16), i = parseInt(e.slice(r + 7, r + 9), 16);
					if ((n & 192) == 128 && (i & 192) == 128) {
						let e = a << 12 & 61440 | n << 6 & 4032 | i & 63;
						t += e < 2048 || e >= 55296 && e <= 57343 ? "���" : String.fromCharCode(e), r += 6;
						continue;
					}
				}
				if ((a & 248) == 240 && r + 9 < i) {
					let n = parseInt(e.slice(r + 4, r + 6), 16), i = parseInt(e.slice(r + 7, r + 9), 16), o = parseInt(e.slice(r + 10, r + 12), 16);
					if ((n & 192) == 128 && (i & 192) == 128 && (o & 192) == 128) {
						let e = a << 18 & 1835008 | n << 12 & 258048 | i << 6 & 4032 | o & 63;
						e < 65536 || e > 1114111 ? t += "����" : (e -= 65536, t += String.fromCharCode(55296 + (e >> 10), 56320 + (e & 1023))), r += 9;
						continue;
					}
				}
				t += "�";
			}
		}
		return t;
	});
}
H.defaultChars = ";/?:@&=+$,#", H.componentChars = "";
//#endregion
//#region ../../node_modules/.pnpm/mdurl@2.1.0/node_modules/mdurl/lib/encode.mjs
var qt = {};
function Jt(e) {
	let t = qt[e];
	if (t) return t;
	t = qt[e] = [];
	for (let e = 0; e < 128; e++) {
		let n = String.fromCharCode(e);
		/^[0-9a-z]$/i.test(n) ? t.push(n) : t.push("%" + ("0" + e.toString(16).toUpperCase()).slice(-2));
	}
	for (let n = 0; n < e.length; n++) t[e.charCodeAt(n)] = e[n];
	return t;
}
function U(e, t, n) {
	typeof t != "string" && (n = t, t = U.defaultChars), n === void 0 && (n = !0);
	let r = Jt(t), i = "";
	for (let t = 0, a = e.length; t < a; t++) {
		let o = e.charCodeAt(t);
		if (n && o === 37 && t + 2 < a && /^[0-9a-f]{2}$/i.test(e.slice(t + 1, t + 3))) i += e.slice(t, t + 3), t += 2;
		else if (o < 128) i += r[o];
		else if (o >= 55296 && o <= 57343) {
			if (o >= 55296 && o <= 56319 && t + 1 < a) {
				let n = e.charCodeAt(t + 1);
				if (n >= 56320 && n <= 57343) {
					i += encodeURIComponent(e[t] + e[t + 1]), t++;
					continue;
				}
			}
			i += "%EF%BF%BD";
		} else i += encodeURIComponent(e[t]);
	}
	return i;
}
U.defaultChars = ";/?:@&=+$,-_.!~*'()#", U.componentChars = "-_.!~*'()";
//#endregion
//#region ../../node_modules/.pnpm/mdurl@2.1.0/node_modules/mdurl/lib/format.mjs
function Yt(e) {
	let t = "";
	return t += e.protocol || "", t += e.slashes ? "//" : "", t += e.auth ? e.auth + "@" : "", e.hostname && e.hostname.indexOf(":") !== -1 ? t += "[" + e.hostname + "]" : t += e.hostname || "", t += e.port ? ":" + e.port : "", t += e.pathname || "", t += e.search || "", t += e.hash || "", t;
}
//#endregion
//#region ../../node_modules/.pnpm/mdurl@2.1.0/node_modules/mdurl/lib/parse.mjs
function Xt() {
	this.protocol = null, this.slashes = null, this.auth = null, this.port = null, this.hostname = null, this.hash = null, this.search = null, this.pathname = null;
}
var Zt = /^([a-z0-9.+-]+:)/i, Qt = /:[0-9]*$/, W = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/, $t = [
	"%",
	"/",
	"?",
	";",
	"#",
	"'",
	"{",
	"}",
	"|",
	"\\",
	"^",
	"`",
	"<",
	">",
	"\"",
	"`",
	" ",
	"\r",
	"\n",
	"	"
], en = [
	"/",
	"?",
	"#"
], tn = 255, nn = /^[+a-z0-9A-Z_-]{0,63}$/, rn = /^([+a-z0-9A-Z_-]{0,63})(.*)$/, an = {
	javascript: !0,
	"javascript:": !0
}, on = {
	http: !0,
	https: !0,
	ftp: !0,
	gopher: !0,
	file: !0,
	"http:": !0,
	"https:": !0,
	"ftp:": !0,
	"gopher:": !0,
	"file:": !0
};
function sn(e, t) {
	if (e && e instanceof Xt) return e;
	let n = new Xt();
	return n.parse(e, t), n;
}
Xt.prototype.parse = function(e, t) {
	let n, r, i, a = e;
	if (a = a.trim(), !t && e.split("#").length === 1) {
		let e = W.exec(a);
		if (e) return this.pathname = e[1], e[2] && (this.search = e[2]), this;
	}
	let o = Zt.exec(a);
	if (o && (o = o[0], n = o.toLowerCase(), this.protocol = o, a = a.substr(o.length)), (t || o || a.match(/^\/\/[^@\/]+@[^@\/]+/)) && (i = a.substr(0, 2) === "//", i && !(o && an[o]) && (a = a.substr(2), this.slashes = !0)), !an[o] && (i || o && !on[o])) {
		let e = -1;
		for (let t = 0; t < en.length; t++) r = a.indexOf(en[t]), r !== -1 && (e === -1 || r < e) && (e = r);
		let t, n;
		n = e === -1 ? a.lastIndexOf("@") : a.lastIndexOf("@", e), n !== -1 && (t = a.slice(0, n), a = a.slice(n + 1), this.auth = t), e = -1;
		for (let t = 0; t < $t.length; t++) r = a.indexOf($t[t]), r !== -1 && (e === -1 || r < e) && (e = r);
		e === -1 && (e = a.length), a[e - 1] === ":" && e--;
		let i = a.slice(0, e);
		a = a.slice(e), this.parseHost(i), this.hostname = this.hostname || "";
		let o = this.hostname[0] === "[" && this.hostname[this.hostname.length - 1] === "]";
		if (!o) {
			let e = this.hostname.split(/\./);
			for (let t = 0, n = e.length; t < n; t++) {
				let n = e[t];
				if (n && !n.match(nn)) {
					let r = "";
					for (let e = 0, t = n.length; e < t; e++) n.charCodeAt(e) > 127 ? r += "x" : r += n[e];
					if (!r.match(nn)) {
						let r = e.slice(0, t), i = e.slice(t + 1), o = n.match(rn);
						o && (r.push(o[1]), i.unshift(o[2])), i.length && (a = i.join(".") + a), this.hostname = r.join(".");
						break;
					}
				}
			}
		}
		this.hostname.length > tn && (this.hostname = ""), o && (this.hostname = this.hostname.substr(1, this.hostname.length - 2));
	}
	let s = a.indexOf("#");
	s !== -1 && (this.hash = a.substr(s), a = a.slice(0, s));
	let c = a.indexOf("?");
	return c !== -1 && (this.search = a.substr(c), a = a.slice(0, c)), a && (this.pathname = a), on[n] && this.hostname && !this.pathname && (this.pathname = ""), this;
}, Xt.prototype.parseHost = function(e) {
	let t = Qt.exec(e);
	t && (t = t[0], t !== ":" && (this.port = t.substr(1)), e = e.substr(0, e.length - t.length)), e && (this.hostname = e);
};
//#endregion
//#region ../../node_modules/.pnpm/mdurl@2.1.0/node_modules/mdurl/index.mjs
var cn = /* @__PURE__ */ s({
	decode: () => H,
	encode: () => U,
	format: () => Yt,
	parse: () => sn
}), ln = /* @__PURE__ */ s({
	Any: () => un,
	Cc: () => G,
	Cf: () => dn,
	P: () => fn,
	S: () => pn,
	Z: () => mn
}), un = /[\0-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/, G = /[\0-\x1F\x7F-\x9F]/, dn = /[\xAD\u0600-\u0605\u061C\u06DD\u070F\u0890\u0891\u08E2\u180E\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u206F\uFEFF\uFFF9-\uFFFB]|\uD804[\uDCBD\uDCCD]|\uD80D[\uDC30-\uDC3F]|\uD82F[\uDCA0-\uDCA3]|\uD834[\uDD73-\uDD7A]|\uDB40[\uDC01\uDC20-\uDC7F]/, fn = /[!-#%-\*,-\/:;\?@\[-\]_\{\}\xA1\xA7\xAB\xB6\xB7\xBB\xBF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061D-\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u09FD\u0A76\u0AF0\u0C77\u0C84\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B4E\u1B4F\u1B5A-\u1B60\u1B7D-\u1B7F\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2308-\u230B\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E4F\u2E52-\u2E5D\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]|\uD800[\uDD00-\uDD02\uDF9F\uDFD0]|\uD801\uDD6F|\uD802[\uDC57\uDD1F\uDD3F\uDE50-\uDE58\uDE7F\uDEF0-\uDEF6\uDF39-\uDF3F\uDF99-\uDF9C]|\uD803[\uDD6E\uDEAD\uDED0\uDF55-\uDF59\uDF86-\uDF89]|\uD804[\uDC47-\uDC4D\uDCBB\uDCBC\uDCBE-\uDCC1\uDD40-\uDD43\uDD74\uDD75\uDDC5-\uDDC8\uDDCD\uDDDB\uDDDD-\uDDDF\uDE38-\uDE3D\uDEA9\uDFD4\uDFD5\uDFD7\uDFD8]|\uD805[\uDC4B-\uDC4F\uDC5A\uDC5B\uDC5D\uDCC6\uDDC1-\uDDD7\uDE41-\uDE43\uDE60-\uDE6C\uDEB9\uDF3C-\uDF3E]|\uD806[\uDC3B\uDD44-\uDD46\uDDE2\uDE3F-\uDE46\uDE9A-\uDE9C\uDE9E-\uDEA2\uDF00-\uDF09\uDFE1]|\uD807[\uDC41-\uDC45\uDC70\uDC71\uDEF7\uDEF8\uDF43-\uDF4F\uDFFF]|\uD809[\uDC70-\uDC74]|\uD80B[\uDFF1\uDFF2]|\uD81A[\uDE6E\uDE6F\uDEF5\uDF37-\uDF3B\uDF44]|\uD81B[\uDD6D-\uDD6F\uDE97-\uDE9A\uDFE2]|\uD82F\uDC9F|\uD836[\uDE87-\uDE8B]|\uD839\uDDFF|\uD83A[\uDD5E\uDD5F]/, pn = /[\$\+<->\^`\|~\xA2-\xA6\xA8\xA9\xAC\xAE-\xB1\xB4\xB8\xD7\xF7\u02C2-\u02C5\u02D2-\u02DF\u02E5-\u02EB\u02ED\u02EF-\u02FF\u0375\u0384\u0385\u03F6\u0482\u058D-\u058F\u0606-\u0608\u060B\u060E\u060F\u06DE\u06E9\u06FD\u06FE\u07F6\u07FE\u07FF\u0888\u09F2\u09F3\u09FA\u09FB\u0AF1\u0B70\u0BF3-\u0BFA\u0C7F\u0D4F\u0D79\u0E3F\u0F01-\u0F03\u0F13\u0F15-\u0F17\u0F1A-\u0F1F\u0F34\u0F36\u0F38\u0FBE-\u0FC5\u0FC7-\u0FCC\u0FCE\u0FCF\u0FD5-\u0FD8\u109E\u109F\u1390-\u1399\u166D\u17DB\u1940\u19DE-\u19FF\u1B61-\u1B6A\u1B74-\u1B7C\u1FBD\u1FBF-\u1FC1\u1FCD-\u1FCF\u1FDD-\u1FDF\u1FED-\u1FEF\u1FFD\u1FFE\u2044\u2052\u207A-\u207C\u208A-\u208C\u20A0-\u20C1\u2100\u2101\u2103-\u2106\u2108\u2109\u2114\u2116-\u2118\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u2140-\u2144\u214A-\u214D\u214F\u218A\u218B\u2190-\u2307\u230C-\u2328\u232B-\u2429\u2440-\u244A\u249C-\u24E9\u2500-\u2767\u2794-\u27C4\u27C7-\u27E5\u27F0-\u2982\u2999-\u29D7\u29DC-\u29FB\u29FE-\u2B73\u2B76-\u2BFF\u2CE5-\u2CEA\u2E50\u2E51\u2E80-\u2E99\u2E9B-\u2EF3\u2F00-\u2FD5\u2FF0-\u2FFF\u3004\u3012\u3013\u3020\u3036\u3037\u303E\u303F\u309B\u309C\u3190\u3191\u3196-\u319F\u31C0-\u31E5\u31EF\u3200-\u321E\u322A-\u3247\u3250\u3260-\u327F\u328A-\u32B0\u32C0-\u33FF\u4DC0-\u4DFF\uA490-\uA4C6\uA700-\uA716\uA720\uA721\uA789\uA78A\uA828-\uA82B\uA836-\uA839\uAA77-\uAA79\uAB5B\uAB6A\uAB6B\uFB29\uFBB2-\uFBD2\uFD40-\uFD4F\uFD90\uFD91\uFDC8-\uFDCF\uFDFC-\uFDFF\uFE62\uFE64-\uFE66\uFE69\uFF04\uFF0B\uFF1C-\uFF1E\uFF3E\uFF40\uFF5C\uFF5E\uFFE0-\uFFE6\uFFE8-\uFFEE\uFFFC\uFFFD]|\uD800[\uDD37-\uDD3F\uDD79-\uDD89\uDD8C-\uDD8E\uDD90-\uDD9C\uDDA0\uDDD0-\uDDFC]|\uD802[\uDC77\uDC78\uDEC8]|\uD803[\uDD8E\uDD8F\uDED1-\uDED8]|\uD805\uDF3F|\uD807[\uDFD5-\uDFF1]|\uD81A[\uDF3C-\uDF3F\uDF45]|\uD82F\uDC9C|\uD833[\uDC00-\uDCEF\uDCFA-\uDCFC\uDD00-\uDEB3\uDEBA-\uDED0\uDEE0-\uDEF0\uDF50-\uDFC3]|\uD834[\uDC00-\uDCF5\uDD00-\uDD26\uDD29-\uDD64\uDD6A-\uDD6C\uDD83\uDD84\uDD8C-\uDDA9\uDDAE-\uDDEA\uDE00-\uDE41\uDE45\uDF00-\uDF56]|\uD835[\uDEC1\uDEDB\uDEFB\uDF15\uDF35\uDF4F\uDF6F\uDF89\uDFA9\uDFC3]|\uD836[\uDC00-\uDDFF\uDE37-\uDE3A\uDE6D-\uDE74\uDE76-\uDE83\uDE85\uDE86]|\uD838[\uDD4F\uDEFF]|\uD83B[\uDCAC\uDCB0\uDD2E\uDEF0\uDEF1]|\uD83C[\uDC00-\uDC2B\uDC30-\uDC93\uDCA0-\uDCAE\uDCB1-\uDCBF\uDCC1-\uDCCF\uDCD1-\uDCF5\uDD0D-\uDDAD\uDDE6-\uDE02\uDE10-\uDE3B\uDE40-\uDE48\uDE50\uDE51\uDE60-\uDE65\uDF00-\uDFFF]|\uD83D[\uDC00-\uDED8\uDEDC-\uDEEC\uDEF0-\uDEFC\uDF00-\uDFD9\uDFE0-\uDFEB\uDFF0]|\uD83E[\uDC00-\uDC0B\uDC10-\uDC47\uDC50-\uDC59\uDC60-\uDC87\uDC90-\uDCAD\uDCB0-\uDCBB\uDCC0\uDCC1\uDCD0-\uDCD8\uDD00-\uDE57\uDE60-\uDE6D\uDE70-\uDE7C\uDE80-\uDE8A\uDE8E-\uDEC6\uDEC8\uDECD-\uDEDC\uDEDF-\uDEEA\uDEEF-\uDEF8\uDF00-\uDF92\uDF94-\uDFEF\uDFFA]/, mn = /[ \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]/, hn = [
	8364,
	0,
	8218,
	402,
	8222,
	8230,
	8224,
	8225,
	710,
	8240,
	352,
	8249,
	338,
	0,
	381,
	0,
	0,
	8216,
	8217,
	8220,
	8221,
	8226,
	8211,
	8212,
	732,
	8482,
	353,
	8250,
	339,
	0,
	382,
	376
];
function gn(e) {
	return e === 0 || e >= 55296 && e <= 57343 || e > 1114111;
}
function _n(e) {
	return gn(e) ? 65533 : e >= 128 && e <= 159 && hn[e - 128] || e;
}
function vn(e) {
	return e - 1 >>> 0 < 127 || e - 160 >>> 0 < 55136 ? String.fromCharCode(e) : String.fromCodePoint(_n(e));
}
//#endregion
//#region ../../node_modules/.pnpm/entities@8.1.0/node_modules/entities/dist/internal/decode-shared.js
var K = /* #__PURE__ */ (() => {
	let e = /* @__PURE__ */ new Uint8Array(127), t = 0;
	for (let n = 33; n <= 126; n++) n !== 34 && n !== 36 && n !== 92 && (e[n] = t++);
	return e;
})();
function yn(e, t, n, r, i, a) {
	let o = e.length, s = a * 90, c = 0, l = () => {
		let t = K[e.charCodeAt(c++)];
		return t < a ? t : t * 91 - s + K[e.charCodeAt(c++)];
	}, u = n - r, d = n + i, f = new Int32Array(d);
	f.fill(-1, r, a), f.fill(-1, a + u, d);
	let p = new Int32Array(d), m = new Int32Array(d);
	function h(t, n) {
		let r = 0, i = n, a = n + t;
		for (; i < a;) {
			let t = K[e.charCodeAt(c++)];
			if (t < 89) r += t, f[i++] = r;
			else if (t === 89) {
				let t = K[e.charCodeAt(c++)] + 2;
				for (; t--;) f[i++] = ++r;
			} else {
				let t = K[e.charCodeAt(c++)];
				r += 89 + (t < 90 ? t * 91 + K[e.charCodeAt(c++)] : K[e.charCodeAt(c++)] * 8281 + K[e.charCodeAt(c++)] * 91 + K[e.charCodeAt(c++)]), f[i++] = r;
			}
		}
	}
	h(r, 0), h(u, a);
	let g = new Int32Array(i * 2), _ = 0, v = 0;
	function y(e, t) {
		for (let n = 0; n < e; n++) {
			let e = t + n, r = l(), i = l();
			g[v * 2] = r, g[v * 2 + 1] = i, v += 1, p[e] = _;
			let a = (f[r] < 0 ? m[r] : 1) + (f[i] < 0 ? m[i] : 1);
			m[e] = a, _ += a;
		}
	}
	y(i - a + r, a + u), y(a - r, r);
	let b = new Uint16Array(_), x = 0;
	for (let e = 0; e < v; e++) for (let t = 0; t < 2; t++) {
		let n = g[e * 2 + t], r = f[n];
		if (r < 0) {
			let e = p[n], t = e + m[n];
			for (; e < t;) b[x++] = b[e++];
		} else b[x++] = r;
	}
	let S = new Uint16Array(t), C = 0;
	for (; c < o;) {
		let t = K[e.charCodeAt(c++)];
		t >= a && (t = t * 91 - s + K[e.charCodeAt(c++)]);
		let n = f[t];
		if (n < 0) {
			let e = p[t], n = e + m[t];
			for (; e < n;) S[C++] = b[e++];
		} else S[C++] = n;
	}
	return S;
}
//#endregion
//#region ../../node_modules/.pnpm/entities@8.1.0/node_modules/entities/dist/generated/decode-data-html.js
var bn = /* #__PURE__ */ yn("!}.&u%}'&}*'~!6*)%&,~!J~!J~%L~y<~!R,~~%Lu~~#GD~~#|)1#%}^%}2%+#.##%##%}&%##%'#%##&%#%#'%#&#%#&#'#%%#&#%##%#)%''%&%#%#'%#%%#%%}%%%#%#&(23#%%#&-%0%('1#(##%#'##+%'*.:1}#%#6-+(%'%%#%%%}#L'2351&('%}&/N'(0(/*-%(%%}#'+&T%7.2}#&%&#%#36/5##%&%%#&#%%#))2%%##%&&'0~!#*+&'%1~!%).'3q?&%'1~!.##%6(~!+%%%(Gw'rT~!E#<nA%#jZ~!H%(~!42##~!*31&~!G%U~#)5~#`3~!J~!Z~%]~%Y~%C~!q~!u~#kz~%#~!6'~!D~!U~!?~#T~!c%~!G#'~%7|~!G~!J~!G&~#pb~(Df}#%}*&}#%##%##%##&#-}&'#'&%#.++}%mI,#,@&(}*%}*'%&##&#%##%}&0}#.},U},%}+%}&%}#%##&}B%(}(%}+%)})%##%#&}&%##%&}<%}>%#%&}*%}(%}9%}/%})%}*%}*%}?&}&%}3%}&*#%})%#%#)}#&#-#+*%E%%'%'#%}#*V##&##I}#&&##%&%#&&Qf%%))w/0+&%#(#.%-''''++++7}>%4'',##1,#%#&%##&#'##&#*#9)%&%}#*}%,#+P(%A&%#'&##wSD',9E00#y#@}(+}&%&>~!#~!X}#*}(&&}(&}(,%}%&#+&}#&}I%#%}%)#(},'%#*}4%%#%}(''}#/##(##),%-##%%)#&}(.}&%#&}%%}*&#%},&&}&%}#%*'#%})%}D&}&%}-&}6&#&}-,%}#%})-(~+`~,=?~I9'9%~!,#%})%})%}@%}?%}(~!?~#<~#pP~#BG~#=1#%K+~#?#~%;)~#A~#mF1~#A'~'X%'~#lR~#N~'N~#r~#m#-~#i'?%#'%~#B%##%,%#~#_%#0%~#]732~,w~2+#:&#%&'0%&>%}#>##F+)#%&&#(+_}4&}-%}(&}@&}O7Fdf0@+/v4}&WU##&/0#&'('B#%}.%}'+#%}#%%&#&%#%##+#&#)#6#'#.},%}c%},%#%##%&#&%#&~#>'*-.%##%##%}#%%}%'~#)D1}#%*&~#_%%'(~#S2%'.}#~#=##*'*-%}&'%'##&&~'E%.#&~#M4}%%##&'%#~#O1##%&#'+~#<B%##%%'%+~#;#@%}#&%#&&%#(~#H1}'%'##&&~#?A}&'~#D#%32}'&&&&~#[}'(#%}'~#;C})&}%%#%~#=&%,3}%'(#%%~#^'#&&)#%'~#Y%-~#d-%'~#^%%&#&&&}#~#b~2t*&'~&(~&@~0%~e~3}%*''0})&}+~!9##-}#%-hD*)1fC#%/&/fB#40~!+#)*4~!+~!K'&:~!/*7~!.#~!H~!L':~%x&~!H#~!*~%1~!I#~!+A~#p'~!F~~#-#~,,(~.Z~!V~%;'B'mq-W~!N~%I%#&&#&}#%},%%}'%}+X#%}#&}(%}'%}<%}#%}%%'}'%}:~![)9@~%>~#UA%-%##&~!C%~!-.9:~!1~!-^2/:a~!y,D*J#-5)/4~%23,~#G~!L1~!0X3`~!2+~!!0-~&E~!W~!o,>Y&]~%cZx_&~#O*9#A#'#+I'%#)~!0B*-5A+-((F&*M#)(-7-5+'-3a5Vi~!Y~!?+[)%3),ERHm~!+:D,VG.+)?fB%%*(%)'(#&80%1'8`K8?`+'Z#&O&'H5#*9)A%%5&3))0%39+.*7#()&&*=4@**L)<'_&*+..;(#*+)./&0#3)%')-8(4ixD(&.}%,('aI:,)%,k2231T)I'#/-W7,/'Q#.'Y24+h')37</31&83##&0#),H(?'&?/1##%#&&#%''-%&&&#(&''&#.-'%#%%(,')*'&#&#'##%(%(#%('#&##%%%%('%#%#%%#%#&%##h>w+v<ayvyvcg.uuhKr}g/v|g>u9i[~>g5uI~=RvdwEg;v/g;uk!!TTSx]@RT!U!#!@VBRUU!'UTe-d0c`e&gSdicedFcrdTaqb.kYcAohdYd@a3e+d}dMdtd.aJ#bqcK`dle/e.e'dwdPdodddjbEb}ogd^ofdpduc6j?l%d{drdqc)d7bacOdQ%T#Y)X.sR[yH>6Vyv3[xwLu>vo'!*.[yBacahoj>6Rew3[xqdZa#!a&#^(X-[yG>6Vyu3[xvg3sEr|g.u/Ri9db0T#^(Xa)!-[y;>6Vylg4wKs{JwNZt3@3r=c4Z([xlg;wKt!cpq's@v7A'*a(a+!-a#[y<3Dt?3Dt'>6Vym3[xmg9rxsNJwLZt4~?r?db1T#`-!(Xa,!0[yS>6Vz%NuQs.g4wKtnJwNZtS@3r>c4Z([y%g;wKtrdga8!a(!#&T*Y-Xa#!a0<or[yc3Dtq>6Vz43[y3JwNZtf@3s!Ju}!%Dti:pm3c_%X#tjB5pkd6q!r]u?voC'*-a.a2!0a&a+[yI3DtI3Ds~3DtH>6Vyw3[xx;:s#~<5pKJwNZtE@3r~d`a)!a2T#a.(!+U.X1[yT3Dt`3Dtv>6Vz&3[y&g9rxwzcxstPu.<rAJwLZtT~?r@dZa%!a.&^*Za(/Reu[ya>6Vz23[y1g3sEr}wkg{NuQRg{ci(U#5@b`~,cg#U(2WnH5wugcRh7dX#T(Y,a'Ta!!a,[yZ<]mj>6Vz,3[y+Pv#5ReZKu+=,%!H}7ABwkaS?Rh:BcW(X#<]mrj:ubv/ARekdg%!(!a.*Ta(Y.X1!#sP>Rl*Dt6[y>>6Vyo3Wf*jOvuumvuRgRJuq*!:9<B@bX~3jVv&v@s@5Re[d/rQt{uAvo&a&a*)a2!,0Wf!3Dt0=Bs'>6Re}3[xy~<5s%JwJZt1~Gs)c;&!#2sJkNuXvzq7rxu,Re8dka4!a8(aEZ+a@Y.X1Xa)[yd=Bs(3DtP>6Vz53[y4cX#X&Re:avRe9~<5s&JwJZtQ~Gs*i^rzvdRg+Jv{%!2sbB@bX}kdga,!Za?&^*T1/!a'Dt+[y6>6Vyf3Wf%g/u;s4hGu6?Rh-JvZ,!c%#&RoX54Rivj7uyvf8RgTKvZB%*!2sGh<vu5Rgq<=C::9bb~#dZ#T&Ta6Y.X*Dt>[y93Wf)coZ(T,6VyifluvRgC@95@B@bX~/hFu34cC#T,k/unq8w8Q5RkUklwQuzunq8w8Q5Rk8d/rJu?v8w9)-&!a0a;a&aIWejg3sEr/h1s<DtDJvyZqY5aws3Jvy!&Wei~Hr1:au5@Bag>23E~5c:Z&bX};kKv?w&unuVu5Rjc;>bs)#~@:Rh.=ay<a]C;b`}Vd6s/t{uAvoaxa()!a,a7%-a#a2Dt,[yF2Wo[>6Vyt3[xuNuPRi&NuPwpi#RoWh?vf8Ri%Jv]!%Ri:KvxD!.'2WeAjZu`q9rxu,Re7woeAg-unLq(qA_/*2Wg_g3u5q^9:4E}/jTrxrzv=Wkkd~0UX#^^Xa-a1a5T&a=U1a'*aEa]!a*aPaA-adok[y54Rn>;:p3~Dp5g9rpsFNvZqjg3uJp4~<5p0Pw;5qlJwNZt*@3p1Pw:5p/Ou!5p2JvG'!6Vye=<qnJvh_[xhg3v,Rh3kOwOw-sDuev/Re^dha[a%!%!a+#Ta7)-5TaCaO!aka!a)sf[yb2>Rl!9ARiq5E}Qg=ucRkBE|oJrJ_@Wk~@Wk{JrJ_@Wk|@WkyJrJ_@Wk}@WkzJvO_[y2g-vMRmiKuYC!)&>Ri;>Ri<@3RkNc](X#@9Rk=g5vuRmhKvDB!+'=]meg3u4Rmgd)#Y'Vz3CARmfd`a+!%T'!+#Ta1Ta6TaM-sTDt9[yA9sYd'%Y#s[[xpj:ueunaXRgEjRq,v-vuqdd2'`#6Rev<32@5>:2<E}5xIo9a*X#Y(;5RePJvD_g>vyRgNj8w)v8<wggs:RgXiZt|vjx,hSq3ah!-(~@:Ro/Ou!5RhWj^v(pyw8unRhUdx-UY#^Ua.a3a70!)%UX1TaDa)'omRiRRhE[y:3Dsz=Br,>6Vyj3[xkg6ruwjcqsrPw;5r*Ku]D'Zt-@3r(~?r.i[vwv]dU1a--U#`a4(g/vsRhPOu!5RhLj:rmu9Wo!~@:wdh@g/vsRiTjXuvvNr}:RhBj^v(pyw8unRn]dz1UYa'a+^Y(!aETZalaRY.Ta?a4[yDJw1!#qLsW>6Vyrfzq-pLflpwRe|Js>%!Dt@3Dt&Jvy_[xs~HrnjMuwpsw'RecKu+D#'!t<~Grl~?rjg5u-x,gwp{ah!-(~@:Rg~Ou!5Rh'jXuvvNr}:Rh#cW#X/c;&!#2sLi[v7u7RgpJv)(!iLrxu,Re6j7v@s@5Se[e7d`aW!Za(a`T.a#!a3!&aDa-!9)Dt_=6s+3[x~~DR|h~DS6avhGun5RkZj3w)v-]mkKunB!&*]kb97R|i<ARk<c:Z(6Vy}Juh'!wziMRoS:F|vkLuauJv5vtvQRh1d='T+Y#VyO~DR|jcF#T'7R|g97R|kJv3'!ay<Rj,Jvh&!:ReXcsa6*a+#a#_aIRf9aLRf?c,Z&Rf5Rf7c.Z&Rf;Rf>cQ#%T'p-Rf8Rf=ct#%'(*!,p,Rf4p+Rf6Rf:Rf<d~'Ua%U*^UYa(!a,-!#a4YaTalaEX0a8a<Weo3Dt/3Dsx=Br93Wen~Dr;~<5p<JwNZt2@3p=Pw:5p;Ou!5r3c7&!#:p>3Ds}KvGB)_6Vyk2sM=<r7x'eovA(!hFu1ARf}cV#X&@r5j6rvwQa^Rf3c=Za'wkghJv__g;unRggA53B9=b^}%j6uduo5Jq;!(hIv%2Re`Ou4ARe_e%a#^^^Xa&!a*a2!&a6YaP!*ad!#a:aE/5Rn?[y@>6Vyp;:pE~DrY~<5pBJwNZt8@3pCh=rt3rWPw:5pAJup_[xoNuPpF9c!#'45pD5ARn)d8#X'X*3@rU72s]h>v<<sSjJpqvewOJq/(!hNw'5ReBk0s2u3w/w'5ReE5@Jq.!a+JQ!&WeU23d(#Y&RjG5]jBk!u7w&u0udARjEe#+^^^Ub#!a2/a`Z(agT1!a-a;|@TaG!aS[yV=Re~fow'RguNuPRe?bz#'>RoUWeL>:Cbb|?JwPZtVg6ruRmzJvD'!6Vz(g/vmRh~Jvy_[y(g9voRgyx*cy(#2>Ri2B9b]~9kIw9u7rluJu3Rg]dI#a%UY'@=p%CAx.gQZ&RhwwygtRm{x5g_Z'+ABqR9Woa=Bp&dV#^*Xa'!&@o{g4v]Rk;Jv{!%Rk[wkkiA5RkiwwfUB=x,fUuqC&*!>RfTg8v0RfV~ARfSd;rJsAuAv9wR'ae+/aO!a@aza/a#[yQ@Wg!2Wemg3sEr0JvB_g>uvReWg2v+Re=KupB_+[y!2AbY~-~Hr2AJwD!(h<~El>h<~El?Kun@+_:9b`}Kg-v/Ri3g;vtwyk_9]k_d=&T#*U.6qh@Ab`|K9:H|CJv[!&3Dtex'fDwC%!Rf[9WlMd[(^X,!a%Z06Vz!@WgBg=v~Rgvg,QRe@awd,#Y+jTv|Q~EfWj]uNr|~FRfXdy#Y&^Ua%!aO.!(a)Ua;=!a@aKap!a-,a!Ta]a[rSa]p?[y82sK=Bq~;:p:~<5p8Pw:5p7d'#Y'Wf(;RnRi[u4w&RgJJvG'!6Vyh=<r#ijuuv/sIKuYD'ZtG@3p9~Gr&d2#`(g<vtRgFj`u5w&rqpxRf2CJuY!+:wfnTOu!5Rg}jNs1ucv&RfwJvA!&3@q|BDcC#T,k/unq8w8Q5RkTklwQuzunq8w8Q5Rk9dga#!a'!a=#a0!:+Tb*b@aO.a4!aba8aFJv^}?!VyR~Dr<g;u%Rn.~<5p[x'e`wNZtR@3p]Pw:5pZhNvjBp.woe_g5u-r4JwF!%DtO3:ooc7&!#:p^3DtpLuGw(!+%)Dtk6Vz#2sd=<r8d'#Y([y#<x3gJt`w@!)%}MRiowzikRij=]ilxAf3,U(#B2Rf#g0v-Rm[ck{`U#]giKv3>)!&6Ri154s,KuGB_%@r68r:dJ|t`#X(9<E|u2@H|rx3gJu?w'!+'1Nu7Reg4=H~+9<wxgY95Rm]xLggZ-`(X}U2:Ri4h<uOawRmsJv__5@bb{jbV~3dka#a'a]!,#a+U=a>b6a3b%!/aKa/)!arwve^VyJ;:pR~DpTg3uJpS~<5pOPw;5qmPw:5pNOu!5pQJvG'!6Vyx=<qoJvA!{~Jup!%@qk7Rn/KvyD!}''[xz;>wkh'?Rh,x8gyt`w5D!&),(SgyccRgztJ@3pPB5p#d'(Y#<]mmifubw&RgoJvE&!82s^JvF&!8Rf,ADb]~;x=h'rNu]vK!,%'*0RnORh)4Rh*AqQg-vaRnNg;wHwkh'ba~4cE#Ta*x3gctyw@'!+%RnFRnD<4Rn@hFvK5RnCxWg[#`&a0Ua()`1Rm75Rg[c]%X#qi8Rg^NvdRj>BwzgZauwji7Rm6A4wgg]d1#&(*,.0a#Rm;Rm<Rm=Rm>Rm?Rm@RmARmBe%#^^^Xaea?aC/b+(,!a+a#!a/!>a&Ta<aKbD!2wphBRnk[yPw}hE|.=Br-3Dtm>6Vy~g6urRf.x,hPrNav!%'RnqRo%Ro#Nu;q[Pw;5r+JwNZtM@3r)d'#Y'Weh;xChL#`&RnmRnoKu}>%(!Rne~Bs-;2wjcussJv+'!aYSO}6@B<5?ba~8LrNvj!.%*ROwungw~ng~:9;Ri^>wtnig;wHRnixDh@|(UZ.x1h@|)!#:2<H|*xHn]#-UX'3Ro)z=iT}6ARns=Bwsn_wpnaRncw]aR(#UXa&Ua*a/=]iPd'#Y&Ro'WnXf{QRm2hNvj]nZd`'T~&1`{|`#9b]{}c:'!#Wl{>@=be}]?cl{{U#:5Abb}Jds#^YaF!a*b4a#a3aPa>&Tb!bH!*a_!Eau?/a&RjY<]gj>6Vz*;:pe~DrZg,QRj1JwNZtX@wihspcJvZ&!VyX9WmOJu|!|N2WmHJvh&!]ht~Bpbcn&T(!#RmQ<s7Nu;padH#X'`+WmJ@>RmKCARhnKup=!)&Wf+:RhqNuPpf9c!#'45pd5AwghpARn(Ls@w!%,)!RmP@Wfe<E|IJva!&WmNg8vsRmLd`*.`#Y'Xa!axRn*]hrA8Rhug5s@rXg8u!RmMd8#X'X*3@rV72smdI*#UY&RmICARho~GsgxVgd)Ta'U-Y&Xa!T#RnEWnA@Wffg1uDRi0hFvK5RnBxGnG&#`%owp)@wsf+bX}Ze-*1!a*^^^Ua|!#a.aq&Ya2!a>.a6!a:aO`aJDtL[y`@Wg#>6Vz12@wzoYRoZNuPRi!NuPRhzg=ucRi,@=b`{Yg=ucRi-ACJvB!&Sh[ebSh]ebi`wUuFRm4Jw2_[y0JvB!.<Ju(!&SoG}6Shd}6<Ju(!&SoH}6She}6Kur@._g5vHRieJvx!{L2G{Kx6gd'T#?Rh82Wi5cZ#X(g1w)Rm5dW-Y(Ta#!a)!#aYa=wnfE=su2>>bU{0j9udv:<svj8uQv-7RgHdE%#^'sq9sp=>Bb_{TJv`!&g/r|snj6v(us5d,#Y(56H}[978H}]Jw5!&g1rushJvB!+j;v{u5?zDhd}6}bj;v{u5?zDhe}6}ce*#`(^^^a[aea!=!a6a*aoXb1a.!aAbL!b>,b'aL!aV@Wf|2Wlg3[y/JwNZt^@3piPw:5pgJunZou3@rsJva&!Vy_g<v~Rm#JvG'!6Vz0=<r{Ju{%!:pj@WfsiXuJu3Rm:JvZ&!WfA~Bph@c4Z&Dtwax5rubx(#:awRk1@d,#Y&RfjRfid1#,Y(@Wfp2Wlrg5s@ryKu[@!,'=]ig9wlk?Rk>g5u-rqJvy'!@9RkQcH(T#=>Ri~@<wkj(Wj(KuZB*!&<7rw@9RkRcH(T#=>Ri}@<wkj)Wj)dg(Ta2Xa9X#`-!a*CARhg@@=I}d9x;c~#X%so=<sj>2@@=aybb}XjWv0Q~EfEj3vLv;<d,#Y(56H}`978H}_dgaPaFa'a/!#a3Y0a_a;a|!1(a7-[yE3[xt;:pJNvZrrg3uJrvJwNZt=@3pIh=rt3rxPw:5pGOu!5rpJvG'!6Vys=<rz@c4Z&Dt(ax5rtJvZ!&~BpH@wsfNg-vaRlNci*U#=<wei<F}a5@Jq.!a*JQ!%@qZ23d(#Y&RjH5]jCk!u7w&u0udARjFd/prq=tyvpaEa(a:.!a1aZ(@@=I}:9wpd%=<sX55w_h}@@=I{t=ay<aU@@=I}T=ay<2@@=I})?C9:9au@9Cb]}DP~=x-fAZ(2Wl1=ay<aU@@=I}>5@d##Y+jTv|vV~EfFj]uNpn~FRfGdgaK!Z2&!a8a-Tb({E!acTbM*!a(DtY[yYd'%Y#sl[y*hHvh>Re5x2c{Z}.j4uCvcawRiMd+#X+_x&d!},<5RkX;2Hzw@x,gavfB-!{CcF&T#Roe;RodwWbBg5urRgaKvHC*_6Vz+<4opieuew&Rmq@d]&Y)X,T#X0Rh}<BqP=4qS9:ReMg/ujReNJw0!/<Jui%!bd{kawwnemRelAxUa?a3#*.&UX(Ya+a/RhvRnQ<o}9Wmtd-#Y&RgSRmw9;Rmxay=Rmyg-vaRmuxEhSrNu,v-voC!%(aR.a(a7+1Ro1>Ro5CE{A9b]{@;5x#eO{:g;urRi+KrNA!%(Ro3>Ro79;Ri_Ku@>{;&!x%gX|{KunA_+g5QRj/g3u5Rj#g>uERj%wio/xRhS&!,!#^1U}wba{8>>@=be}qC@:D5ba{7Ku+A&!}x?ba}t>>@=be}se(aA^^^Uat!b0#{pa+awUazbGa#aLb9bgaWac'a5TbS=Br!d1#`%scp_Jvl!#rT>Re0JvX&!VyN=H{Fcm#U&:pY=ReaJv2&!]h0=]nUJvG'!6Vy|=<r%JrM_=]h2@Wlud'#)U'Wf'b]{i=]h/Jvh!&~BpWg=v]RnMx+ny#'Nu;pVwjnu=]nwxJnx,T#`&Reqwjnt=]nvieu9vrRjLLuYwP(#+!th@wih5pX~Gr'g5v/Rh4KunA'!-CARnP@wwiN:Rm_9x'cvw>!|l=<saKvAA!0&3@q}>w^e1bp#&Re2Re3BDx7gH#T|f5H|eKuZ>!%(:qNAH{]Jv6!+3B2B9=b^{X<5<B92:E{ZLvhwA(a;a%!igQuyRmad+#Y}m@3Rh5d8#X'X*:AqUAHzmaxwbh<aXRnVcF}RT#Nw&cj#U(BWnug/vsRntdka)(a3+.Zb7aYYan1!bVa@Xa}[y^@b[{G=H{+hFu73Rj&Pv#5ReQcK%T#sig1v{Rj'Ku+D#'!t]~Grm~?rkKuMB!01d5#`'Vy.ta3Dtu~Hroc8#'{^45s85AwZbP&!#Rn!wghxWn#KvEA!)&2RlA2RlBx:h|#(T,=]j09Wobz>x]z/@awRoTd+#Y(az]hFhCrm4d,#Y+jTv|Q~EfMj]uNr|~FRfOdCa!Xa9_X#@<plJvf!%b`{(9;Rgwc;.!#2x7cw#T|UDb]|T5Ju={(!=@E{&Jv)&!Ab`{'awJvf!~*>>@=be{#KuY>!+&4Ezyi[ugv&RjIdea+T)#UXa&T-T&a!Rh9auRmW=]kLg5vuRn+g3u4Rn-Ow6ARn,hHus5xNk?#UX(U~)/g8v0RkD~AwkkF?Ri.OuNBwkkA?Ri/d|a2`a*^UYa.!aBTZaTa'Xa;!(!2!-a#b2[yC>6Vyq3[xr2Wi?g1rusVh%s?DtF~<5rbJs;%!DtBfswKtCj[uvuSsEu3RgVx3o:u+wN'*Zt;@3rd~Grh~?rfg8w)Lq)qE&-a%!>bI|`jWv0vV~EfCjTv|vV~Ef@j]uNpn~FRfBcK#T']gWNu7x,k7q4ai(0!hHv8<RhmkMu9vrsBuev/RhlCJvB!,g<v{wchh~@:Rhji[vrv{wchi~@:RhkdS&a5UY#Ta!RgPwwiI5BwciI~@:Rh`x'iJvj'!5]iJPu8Bwch]~@:Rhach)U#h3rp]gLh@t|Ax,hTq3ah!-(~@:Ro0Ou!5RhXj^v(pyw8unRhVd|)`,^UYas!a?/a2Z'a^Ta{Tb7Ta(a#!a,Wf&9sZ3DtAadamov=Bqt3[xig8vsRm~>waiL2b`{QJv*_Ouv2qgj<v]v2BqfdR'X*X#Y-@3qr~Gqv~?p6hHv-]glPup5Lq+q?_%*b_{qF{n9b^{rOu4ARhpKvCD!+&~Bqp:5Dbb}nwoiKl&unuTuBv]v+ueunaXRf0=Jvh!0nKufu8v1w&w7q%w&uHrz:Rgnj5w,uxDJq/(!hNw'5ReCk0s2u3w/w'5ReFd>Za&!*UaA=<wkgsRnSJv^!%Refifw3vyRgOKu_B'!,<]gkiiu:w&Rh<=C@a^<B57@2F{[<B5@aW:=3away9A5aW=<B=C@a^<B57@2F{Ie-#`(^^^bCara.b8aza6!/bZ,!adTbnTbOb+aFaS!aAT9@Wf~2Wli3Dtl2@d,#Y&RfnRfmJwJZtN~GqyJva&!VyMg<v~Rm%iXuJu3Rm9Jv[_=]ih9wlkDRkCd1#`(@Wg>2Wls3cH#T(@<Rj*=>Ri|b~'#23s9h<~El.d'#Y&Dtxi^rzvdRl#d*#U%(o|B2s`hJwSaxRmDKv4B&!1:Rmdd5#`'Vx}to~Hq{x'f1v3(!BA5ba|bJv_&!Wfug1v]ReIdO+U/Y#&G}-8wze=Rh{g1v]ReHg/uQRf/by#)ibQwERl/cH#T(@<Rj+=>Ri{cNu+vlax-!(#a0qa9<Rii2;;bU{H;x<i=&X#Rk`<4wwi=C9H~8xAI(Y#<azRi@45wXI<B9;5bb~7dL(X#Xa(+!aL6Vy{g5QqOau:5au2@ay547EzbxOcU(UX-T#Ta#:Cbb|A?wjh/b_|SOw6ARgtihr}u7Rhy<d1#T)X1@@=I|~=ay<2@@=aybb}Sj3vLv;<d,#Y(56H}A978H}@dGpvs@uAu`vcw9*!aFa+ai%(b!aXa8.a?a[ozWey=sU2@G}Nch&U#Rf_WexKu+D#'!t:~Gr`~?r^j]uNr|~FRg*j^psurwJt|RmcKv)@&!)7Rkv~Br[@wxfO:Rl3co#U'6Rezj_q#vIuavjRltwzeyh@vr5JqD0!>aY?C9:9au@9Cb]}9cl#U*5;5<H||jbuus1ucv&Rfvg1v~d/pppzqFr^a--a~!aMat1(hFv;Wiz@@=Izoj5uuv-7Rix~Cw`fk2WlVcZ#X,k)u3vWs@u2]ktg;wEx'fBq(_2Wg/jTv|vV~EfoJv]!15x'hzqG!(P~EfU~CRl_j6v(us5x4i-#T(2WmZ?C2F|d>Kq<aj1!*jTqIsBv=Wl`~Cw`fi2WlWj`v0u*~>RlR=c>Z,k#u3vWs@u2]kr<c1Z+jTqIsBv=Wla~Cw`fm2WlXdmb3!a{(arZa`bkTa%TbQTa-a9+c'!aM!/[yL=Bqug.w'RifhFvyDRj.g>vgwyk^9]k^Jv3_@WfbAARkhJw2_[x|JvB_wkoIRoKwkoJRoLd'(Y#<]gm=<9<H|yd'%_X#skDtb3awwqkgNulRkgdB#^',9:p'hJwSaxRmEBwVb8@4=H|qLu+w50&!)@3qs~?pU>Awwn;;Rn=c:Z'ARn<=<qwKvC@!/&~BqqJv6!&]eVb^z^xRge'/a%+^`#Sge}6<4Rn3=]n0Pw2>Rn8Jw0!&>Rn:>Rn6cY#a7+!a&=<wkaNw~h3z_c5Z{=wjh#=]nLKv^D!&)Vyz=bW|swYb<WetcG#T(2wxa@qVx@gD#Y&b^|V5JwG&!5bb|pg/w&RgD@x=kHs=uAvn!a%%/'+RmSRh694Ro`g-vaRmRhHv-]mlxCcS#`&ba~.5cD#Ta)P~=d,#Y(56H{>978H{Dd_#{2^Y%_+qbbb{6g3sERhsbU{?dfa.,`a(Xa<!aiX#(55RiG54RiHcI#T'WiU3RiVNvdwtfcRlKNvdd,#Y&RlHRlExQgf.1*^T'X#Sgf}6Wn4=]hfPrk>Rn7Jw0!&>Rn5>Rn9Lunw?&a2!,5<oq@@wqfdRlJj5Q~=d,#Y(~ARfcOuN]fdDKw;ay(}i!547E}j?cI#T(@5bV}iCbV}hdv(^^Tb?a40,b##Tbo!a*bR!a<b|a/!aKai!aU[yK=]o^g:v>ReGJwPZtK<7Rh+h<~El,Pv#5ReR@awwxjCg,ulRjDJv6&!]j!z?aQeeg>w=Sh<eeJw;!&axEzOg,Qosc!#*:wkeJ]eJ>x'h-u(!%Ro.w~h.zPdNZ(X,Ya![x{;9ReY;wkgxRiF:x?ap#Y&RmUg<s2Rkod]+UY0TZ'!a&A9sw<=bczLNvuw{gqzNhJwSaxRmCKuLay!#&s_Rf-55b^{uJvZa!!c%#(55Ri654wmiu5RiuawLu,vp!+}^%b_}Y9;wkgxba}o>A9:=b^}zKuh=a''!3awRk3c*'!#aHRk6c+Z&Rk5Rk4Jv)&!awRjSawd9*`#0?C2@EzMj8u<uJ5RmbjQrquJu3x,k>uq@_+=ayb^|W~ARkEOuN]k@7dhzV^X/X&a-#zRzSb`zXcJzTT#2WkVKvDBzW!%FzY9;5bbzWjQrquJu3Jw3%!b`zU=ayb^zQd:#X(T-a!6Vyywxh}=b]{Jg=u1RiAdGp~qHtzv!w(wA+a+a;<!aJaYai'anasb(=azRmV:Cbb{MLq2vb!%')RjuRjrRjtRjqx3jnqCw3!%')Rk(Rk+Rk&Rk)Lq2vb!%')Rj{RjxRjzRjwLq2vb!%')RjsRjpRjfRjex3jcqCw3!%')Rk'Rk*RjkRjl9<CbbzfOu4ARhxLq2vb!%')RjyRjvRjhRjgx=joq*uKvb!%')+-Rk.Rk%Rj~Rk-Rk#Rj}x=jdq*uKvb!%')+-Rk,Rk!Rj|RjmRjjRjidAq&qKs@uAv8Aa.'*-a@a&0!aM@a5[y73Dsy3Ds|3Dt):wxgI2sHJwJZt.~Gqxwsf0ikrzt}Rl0Jvy_[xj~HqzKv_A|D!&WfP8axRoVcf,U#k(v]v+ueunaXRf1Ju}'!g8u#Ri=jQw!sCunLprq>!,')~<5qeGzq9F{W=c##%s5au:5aU3CBE|;d4#X(D!a&6Vygx(b;#(=]ed?C2F{N<capoq2r[a&!aPa9,'Pw;5s:@@=I|,55w_h|@@=IzcP~=x'fCqB_2Wl2>aU@@=I|1OuNBc1Z+jTqIsBv=Wlc~Cw`fl2WlZ~AcTa%!Z+jTqIsBv=Wlb~Cw`fh2WlYk+uNqJsBv=WlSg,u3dca3#UXaMYa)TaB-=cM|7T#<bI}l5@B932:aV2G{BOuNBJq:|M!5Ezt=<B=C@a^<B57@2F{v>cB{/T#=ay<bI{3Jv6!a.6BKq0ah&+!5E}HP~Ef{978BaU@@=Iza<7d#.Y#978BaU@@=IzH~AJq0!(@@=IzG978BaU@@=IzFe,aU*Y&^^^bvJb,b:bFad!a,c2Ta>aL.bo6!a#CbTa'T#Re{2Wlh2@G{yg6t~Ro_NvdRfticuRQRllJv3&!x&c|zs@Jw3!%RflwpfkRlpKuL;%(!Re<@G|C2GzdhIvuBwgjAg-u0RjAKQB%!(GzZ@G|5NuuRl7d='T+Y#Vy[g<v~Rm!==G|>JvA!)@wma=]m1ifuaw&RmnLs@vT'!|/+[y,g:v>ReTJw1!#qX=x!eC{bLu+wT&)ZtZauq_~Graci&U#F|89:r_Lupvq!.)&2RlG8RfaC=x!eF{_h?rpWlmd&'!#X|&]k::xJey#`'T|+<E|&2@H|%dE#(^,g;u.RiEg6vjRiC9xCkA{O|zY#g=ucRmXKs0@!&*@G|m@awRknJuh!,3d(}gY}eJvj!%Rm):Jw3!%Rm+Rm-Ls0w(&!a(a#@b[|6cZ#X'7RkxWgAOu4ARn'dH'U#Y*Vz-Wm'CARm}d]*#a%^a*T'aK!a<9bV{PC=p*Jw4!&SgxcbB5r]idw(wBRmF7xFkt#&`(Rm/Rm8E|!JuY_9:Rl5=wrgr2:bbxd@xXfB(a*#T+!.X0X1Ta/a'T&RlDRfL>RlyARl9b[z[>RfZ:RlL:RfRwlg/ARl;9;RlxKv,A/!%7s69<74=BA5ba{-8Bde#`a<XaKYa1,a'P~=wxfB2bZ}}?C972@@=I}r8@55B9;5bb}G978B2@@=aybb}3j3vLv;<Jw3&!>Rfk=ayb^}4~Ad1#`*@@=aybb{w2@>==<bbz]dx+UY#^UaF!a9!bB'Ya1.!ajXa#%olRhD[y=3Dt#Ov5BrHKuMB%!(Rf^Wep~HrJwkiQjKr|~FRg)Ku+D#'!t5~GrF~?rDdV)UY,Z/_7RkuG{<~BrBg,rlsO:235B@bX}|d?a1!#`(6Vyn5@d##Y+jTv|vV~EfIj]uNpn~FRfH7Lq2vb1!a9-978BaU@@=Iz9978BbU}#~AJq0!(@@=Iz8978BaU@@=Iz7~AJQ|}!978BbU}!JvkaK!AdUa21-U#`a+(g/vsRn~Ou!5RPj:rmu9WhOjXuvvNr}:RhAj^v(pyw8unRn[kPr}p|u7vwv]RiSBd;pppzq@qHQa?(b.!a.a`@.|xa(hFv;Wiyj5uuv-7Riw~Cw`fg2WlU978BbU|wOuNBJqG!(P~EfD~CRlQcZ#X,k)u3vWs@u2]ksg;wEx'f@q1_2Wg.j]uNpn~FRfqJv]!15x'h{qG!(@@=IzK~CRl^j6v(us5x4i,#T(2WmY?C2F{1>Kq<aj1!*jTqIsBv=Wld~Cw`fj2Wl[j`v0u*~>RlT=c>Z,k#u3vWs@u2]kq<c1Z+jTqIsBv=Wle~Cw`fn2Wl]dn1#c(a(b^a2!b/bAT(bj!aDa7bu,a_a{c0!2T0g:v>ReD2@G{42@G{5~DpM~<5rc=Bx6i>{RT#RnI@zCx]y]z:2Jv[!zr5Awyk]9]k]dD(Y+X#6Vz.g=wKtgwhaCwgmTWj2Lu,w%_+/[y-B;b^xeg3u3Rj-2@bX{*KrJ<!+'@Wg(g?QRlC@Jv`!%b[zIwsfII}8JQ_@w|kW|=Jv(%!AqcOuNBJvEzh!bYzjLs@wP#(0!oy@>RkdJwMZtc3Dtd@BcG#T'9bWxg2@2Fznd*#Y+;2x'c}w<zizixNgwa#Z'U+!/!a'!a+w~g~z6wcn{Rn}wcnzRn|5Rh%=]nJg5vuRmvNvdRlvcprJu}w*az*a#!%.a.'Bot9qT]kj@Wg'ay2Gzv@Jv`!%b[zEwsfHI}1;ck#Ux`<Cbbx_Lu+w!a&0*!wko*wwo,So,}6Juqxf!E}PigQuyRm`d3(`#8>Rn%:A5B;bZ~%KvhCa!a2!x>k7#Uxb@b{#xaRk7Jw0!)>wwhlShl}6>wwhmShm}6CJvB!.x'hhvj{!!5Bwkhhbaz}x'hivjz~!5Bwkhibaz|xEhTrNu,v-vpD!a%&/)a3a.,%Ro2t[CE{)@3re9b]{%wjo09:rgc:Z&Ro6=<riifuaw&RmoKrNA!%(Ro4>Ro89;Ri`dSaL'UYzxZb)7Rka3xRhT&!,!#^1U}vbaz{>>@=be}yC@:D5bazzKu+A&!}{?ba}y>>@=be}wxBh[t`u~vJvr!%a!a()a,a0a4RoC=]o;Ju(!%RoGRhdwjh`=]oAg>w#Ro?g5vuRo=NvdRl|Ku]C.!&;RoEJvB!%RoORoMBx'h[v+_?w~h`}~5?w~hd~!xKh]oiptu-utv.vp!#%&a30a@a'a+(a/aOp(o~p!RoDJu(!%RoHRhewjha=]oBNvdRl}g>w#Ro@g5vuRo>c[#X']o<CauRoRAd-#Y':RkpauRoQKu]C.!&;RoFJvB!%RoNRoPBx'h]v+_?w~ha}t5?w~he}ue!/UbhYacXaW^Tc&a;b:a-c/#b&aja1(!cL+!bKbt!bmcRc9aIc?8[yW3Dtt94Rg`Jv}!&SiRMzBhEebShEMNuPRe>x7gL#TzuwjirRipc<Z&>on;>z=h-MSh.Mwqczx'a7vj&!>Re4@=ResJt__NuPRi*NuPRi)j]uNr|~FRfzKrJ>_+@Wfy@Wf]2WocKrJ<!+'@Wg%g/QRl@@Jv`!&awRl<wsfFIzgLu(w*!.*&ShBMwvhIRhI9;RhNx1hK'!#Sn]Mx1hK~0!#:2<H~7cNu+w7D*'1ZtW>Rn1~?rOc:Z&Rn2=<rQ<7wjh&=BSnLMc]#X(6Vz)w[b=a!U#9wzgMc3#&(RgMRitRis<x,gKt`ax!&+SioM=BSilMc3#&(RgKRinRimKurB,!&SiQMzBhDebShDM6BJQ!(P~Efx978B2@@=I}WLrJw!!,a*&@G}O@9wkibRid@@x'fKwC!&SlDMSfLMjUv~Q~EfKKv3@a+!(hFv-]mpx/hYZ(C5RiWz<o/MwkhY?So/M@x,gbvfB*&!SgEM:SoeeehFu3:Rgbda(,^TZa)X/7Sg[eb:2RgI~BrMC@wgkc:wwkcRerx3h(uUvK!&*,SnOM4Sh*MArRg;wHRh(x=h;rJvPwI!a4',a'0@Wg&=BSh/Mg>w=Rh=g3w*wwgGRgGcW(X#;Sg}M2Gzk@Jv`!&awRl=wsfGIz`dKZ*T'Y-:RhR7RhQg5u-p`j6v(us5d,#Y+~Awkia?RicOuNBwkibba}Ld6p~tyu_vbAa'a+!a/'a3aEa8a!>Sh,ebJv{!&Sh@ebSaReb9;SgwebNuPRi(NvdRl)NuPRi'hHu^<Rm^Jvv_@Wl(g;u1Si/ebKu'B&!*Sh?eb@Wl'z@aPeb95Si.ebcpputyvjB)!,&a+0a%ShAMWeK@G}C@WfJ9;RhMwvhH9w{ia}ix,hJvRA1(!zAn[MRhHx1hJ~*!#hFv(BSn[MBJQ!(@@=I~'978B2@@=I}2db.Ua<'X}+T#a0XaG2G}E;wkg|wuh!Rh!x,hZu,@)!&So0MVy)C5RiXACJvB!&5RiY5RiZg8w)cG}*T#2@bU}=KsA>(!a.3wkhZba~(x,h^u(A!&(SoCMRhb5Bz=h[eb?w~hb~6x,h_u(A!&(SoDMRhc5Bz=h]eb?w~hc~6e)aA1T#T,^^^c-bMb&blcPaP(a/!0!bA=b5c@a(!bfbrc#2afwmhARnjwchORnp2Wlf3DtsNvdRl-2@wpa<]m0bx(#:awRk2@Jw3!%RfhwpfgRlnKQB%!(G{V@G|'NuuRl6d='T+Y#VyUg<v~Rl~==G|<Jv+'!aYShC}6@B<5?ba~8@Jw3'!g2QRljhLrpWlOd+#Y'g.w'rIg>w*wgj@g-u0Rj@Lu+wT&)ZtUauq]~GrGci&U#F|39:rELrNvj!.%*RhCwunfw~nf~:9;Ri]>wtnhg;wHRnhx3hDs@v~!/+'@Wfr@9RkSNu&Rlo=@<5GzoKs0@_+@Wl+@awRkmJuh!-3d(}pY#qWJvj!%Rm(:Jw3!%Rm,Rm*de&!1U-U#`)Re;@G|.@9Ri82@wjfvRlq=@<5GzpLvOvr!).&2RlF8Rf`C=x!eE{.Jw3_g2QRlkhLrpWlPde(!#U{s,UXa*Ta'[y'g:v>ReS;x0PZ&RnlRnn~HrKJw1}f!=x!eB|2w]aP(#Xa&a*Ta.Ua2a7=]iOd'#Y&Ro&WnWg;u.RiDg6vjRiBNvdRlzhNvj]nYJuW_2Wm3x)kFze{9d])!a.!,Y01!#&aC!a3RndC=ox~BrC@2b^{pg,rlse7x'ksuq!%Rm.E{xidw(wBRmGx9o+)X#wwo-So-}69:Rl4@xSf@a#XZ'X)X,Ta(/ARl8b[xc>RfY:RlI:RfQwlg.ARl:9;Rlwdn'#^XafaQa1X1TaHTa)@b[{zcZ#X'7RkwWg@Ou4ARn&x)kG#{,g7u/RkGdH'U#Y*Vz'Wm&CARm|bx#(A]gUbUzJj9Q~=d,#Y(56H}l978H{U7d,0#U*2>ABb_xZ978BbU{e~AJQ{g!978BbU{hxMh?ad{oUYZ.x1h?{l!#:2<H{mx3n[t{vl!,&a%3Ro(z=iS}6ARnr=Bwsn^wvn`Rnbd`*T}B0!#^X'BG{c9b]{a>>@=be}F?JvS!&BG{d7BG}(Bde#`a1X,Ya@!a'P~=wxf@2bZ}I56B2@@=aybb}08@55B9;5bb}<j3vLv;<Jw3&!>Rfg=ayb^}&OuNBKuLA!)a!P~=x#fD{f2@>==<bbzl?C972@@=Ix^d6rSu,v7w*C(0a)a6#B+a%!sQ[y?3Dt%3[xn~<5rLOu!5p@Ku+D#'!t7~GrP~?rNKvlaya7'!h+v-5qMg=t|cd,U#5AAaa5Abb{S@52B5@a[@52B5Gx[iXueu;d<#`a(!/549C;ag>23ExY5@Dah89b^~689Jv)!~2b[~1Lv'w(%*!a#bX|aPrmawRe]keu7uhv-q6rxu,q`xTo]/a5aU!bNaDXbi!b-!ao!b<bwA!#5@B932:aV2G|:d-)Y#hJrL>RhG<7@C5<H|_=Cau:5aj5@B932:bJ|ng>vIbs)#?C2F|9jPv0w.vISh-MKvUaz(.!9ABbb|[5;5<H|Eg>unwfh;9:4E|YjQsBt|vjx'hYq3!(?C2F|J:2<BaY?C2F|GOu!5x,g|p{ah!-(?C2F|c9:4E|OjXuvvNr}:Rh&i[w*t|cd+U#jJvsu)vsSn~Mkfrmu9p}u7vwv]So!McW#Xa!ax5@A5aY:5;5<H|>kJv~vYrquJu3x4ib#T)2@SmZM?C2F|Bj:rmu9@xPhI(a*a#U#`a3-5Abb|L~@:RhK9:4E|0@52B5G|#C::aY?C2F|-:2<BaY?C2F|.5Jvk!a)javYrquJu3x4ia#T)2@SmYM?C2F|HAxPhH(!a#U#`a*-5Abb|4~@:RhJ9:4E|R@52B5G|F:2<BaY?C2F|Sc^#Xa2j=Qq5CJvB!-g<v{z;hhM?C2F|Zi[vrv{z;hiM?C2F|XKsA>!a)-g<v{z;h[eb?C2F|]i[vrv{z;h]eb?C2F|^iZu.vix,hZq3ah!.(?C2F|QOu!5ShXM:2<BaY?C2F|P", 13494, 2713, 49, 25, 61), q;
(function(e) {
	e[e.VALUE_LENGTH = 49152] = "VALUE_LENGTH", e[e.FLAG13 = 8192] = "FLAG13", e[e.BRANCH_LENGTH = 8064] = "BRANCH_LENGTH", e[e.JUMP_TABLE = 127] = "JUMP_TABLE", e[e.VALUE_MASK = 8191] = "VALUE_MASK";
})(q ||= {});
//#endregion
//#region ../../node_modules/.pnpm/entities@8.1.0/node_modules/entities/dist/decode.js
var J;
(function(e) {
	e[e.AMP = 38] = "AMP", e[e.NUM = 35] = "NUM", e[e.SEMI = 59] = "SEMI", e[e.EQUALS = 61] = "EQUALS", e[e.ZERO = 48] = "ZERO", e[e.NINE = 57] = "NINE", e[e.LOWER_A = 97] = "LOWER_A", e[e.LOWER_X = 120] = "LOWER_X";
})(J ||= {});
var xn = 32, Sn = 21, Cn = 2097151, wn = 2047, Tn = 0;
function En(e) {
	let t = e >>> Sn;
	return t === wn ? Tn : t;
}
function Dn(e) {
	return e - J.ZERO >>> 0 <= 9;
}
function On(e) {
	return (e | xn) - J.LOWER_A >>> 0 <= 5;
}
function kn(e) {
	return (e | xn) - J.LOWER_A >>> 0 <= 25;
}
function An(e) {
	return e === J.EQUALS || kn(e) || Dn(e);
}
var jn;
(function(e) {
	e[e.EntityStart = 0] = "EntityStart", e[e.NumericStart = 1] = "NumericStart", e[e.NumericDecimal = 2] = "NumericDecimal", e[e.NumericHex = 3] = "NumericHex", e[e.NamedEntity = 4] = "NamedEntity";
})(jn ||= {});
var Mn;
(function(e) {
	e[e.Legacy = 0] = "Legacy", e[e.Strict = 1] = "Strict", e[e.Attribute = 2] = "Attribute";
})(Mn ||= {});
function Nn(e, t, n, r) {
	let i = (t & q.BRANCH_LENGTH) >> 7, a = t & q.JUMP_TABLE;
	if (a) {
		if (i === 0) return r === a ? n : -1;
		let t = r - a;
		if (t >>> 0 >= i) return -1;
		let o = e[n + t];
		return o === 0 ? -1 : n + i + o - 1 & 65535;
	}
	if (i === 0) return -1;
	let o = i + 1 >> 1, s = n + o + i;
	for (let t = 0; t < i; t++) {
		let i = e[n + (t >> 1)] >> ((t & 1) << 3) & 255;
		if (i === r) return s + e[n + o + t] & 65535;
		if (i > r) return -1;
	}
	return -1;
}
function Pn(e, t, n) {
	return n === 1 ? String.fromCharCode(e[t] & q.VALUE_MASK) : n === 2 ? String.fromCharCode(e[t + 1]) : String.fromCharCode(e[t + 1], e[t + 2]);
}
function Fn(e, t, n) {
	let r = t + 1, i = 0, a = r;
	if (r < n && (e.charCodeAt(r) | xn) === J.LOWER_X) for (r += 1, a = r; r < n;) {
		let t = e.charCodeAt(r);
		if (Dn(t)) i = i * 16 + (t - J.ZERO);
		else if (On(t)) i = i * 16 + ((t | xn) - J.LOWER_A + 10);
		else break;
		r += 1;
	}
	else for (; r < n;) {
		let t = e.charCodeAt(r) - J.ZERO;
		if (t >>> 0 > 9) break;
		i = i * 10 + t, r += 1;
	}
	if (r === a) return 0;
	r < n && e.charCodeAt(r) === J.SEMI && (r += 1), i > 1114111 && (i = 1114112);
	let o = r - t;
	return o >= wn && (Tn = o, o = wn), o << Sn | i;
}
function In(e, t, n) {
	let r = bn, i = e.indexOf("&");
	if (i < 0) return e;
	let a = e.length, o = 0, s = "", c = r[0], l = c & q.JUMP_TABLE, u = (c & q.BRANCH_LENGTH) >> 7;
	do {
		let c = i + 1, d = e.charCodeAt(c), f, p;
		if (d === J.NUM) {
			let n = Fn(e, c, a);
			f = En(n), t && f > 0 && e.charCodeAt(c + f - 1) !== J.SEMI && (f = 0), p = f === 0 ? "" : vn(n & Cn);
		} else if (kn(d)) {
			f = 0, p = "";
			let n = d - l, i;
			if (n >>> 0 < u) {
				let e = r[1 + n];
				i = e === 0 ? -1 : u + e & 65535;
			} else i = -1;
			let o = 0, s = 0, m = i < 0 ? 0 : r[i], h = c + 1;
			trie: for (; h < a;) {
				for (; (m & (q.VALUE_LENGTH | q.FLAG13)) === 0 && (m & q.JUMP_TABLE) !== 0;) {
					let t = m & q.JUMP_TABLE, n = (m & q.BRANCH_LENGTH) >> 7;
					if (n === 0) {
						if (e.charCodeAt(h) !== t) break trie;
						i += 1;
					} else {
						let a = e.charCodeAt(h) - t;
						if (a >>> 0 >= n) break trie;
						let o = r[i + 1 + a];
						if (o === 0) break trie;
						i = i + n + o & 65535;
					}
					if (m = r[i], h += 1, h >= a) break trie;
				}
				if ((m & (q.VALUE_LENGTH | q.FLAG13)) === q.FLAG13) {
					let t = (m & q.BRANCH_LENGTH) >> 7;
					if (e.charCodeAt(h) !== (m & q.JUMP_TABLE)) break;
					h += 1;
					let n = t - 1, a = i + 1, o = 0;
					for (; o + 1 < n; o += 2) {
						let t = r[a];
						if (e.charCodeAt(h) !== (t & 255) || (h += 1, e.charCodeAt(h) !== (t >> 8 & 255))) break trie;
						h += 1, a += 1;
					}
					if (o < n) {
						if (e.charCodeAt(h) !== (r[a] & 255)) break;
						h += 1;
					}
					i += 1 + (t >> 1), m = r[i];
					continue;
				}
				let n = m >>> 14, l = e.charCodeAt(h);
				if (n !== 0) {
					if (l === J.SEMI) {
						f = h - c + 1, p = n === 1 ? String.fromCharCode(m & q.VALUE_MASK) : Pn(r, i, n);
						break;
					}
					if (!t && (m & q.FLAG13) === 0 && (f = h - c, o = i, s = n), n === 1) break;
				}
				let u = Nn(r, m, i + (n || 1), l);
				if (u < 0) break;
				i = u, m = r[i], h += 1;
			}
			if (p === "") {
				let e = m >>> 14;
				e !== 0 && !t && (m & q.FLAG13) === 0 && (f = h - c, o = i, s = e), f > 0 && (p = Pn(r, o, s));
			}
		} else f = 0, p = "";
		f === 0 || n && d !== J.NUM && e.charCodeAt(c + f - 1) !== J.SEMI && c + f < a && An(e.charCodeAt(c + f)) ? i = c : (o < i && (s += e.slice(o, i)), s += p, i = o = c + f), e.charCodeAt(i) !== J.AMP && (i = e.indexOf("&", i));
	} while (i >= 0);
	return s + e.slice(o);
}
function Ln(e) {
	return In(e, !0, !1);
}
//#endregion
//#region ../../node_modules/.pnpm/linkify-it@6.1.0/node_modules/linkify-it/build/index.mjs
var Rn = class {
	src_Any = un.source;
	src_Cc = G.source;
	src_Z = mn.source;
	src_P = fn.source;
	src_ZPCc = [
		this.src_Z,
		this.src_P,
		this.src_Cc
	].join("|");
	src_ZCc = [this.src_Z, this.src_Cc].join("|");
	cache = {};
	opts = {
		maxLength: 1e4,
		urlAuth: !1,
		schema_names: []
	};
	constructor(e = {}) {
		this.opts = {
			...this.opts,
			...e
		};
	}
	set(e = {}) {
		return this.opts = {
			...this.opts,
			...e
		}, this.cache = {}, this;
	}
	escapeRE(e) {
		return e.replace(/[.?*+^$[\]\\(){}|-]/g, "\\$&");
	}
	nestedPairRE(e, t, n = 4) {
		let r = this.escapeRE(e), i = this.escapeRE(t), a = `(?:(?!${this.src_ZCc}|${r}|${i}).)`, o = `${r}${a}{0,1000}${i}`;
		for (let e = 2; e <= n; e++) o = `${r}(?:${a}|${o}){0,1000}${i}`;
		return o;
	}
	get_text_separators() {
		return this.cache.text_separators ??= /[><\uff5c]/;
	}
	get_pseudo_letter() {
		return this.cache.src_pseudo_letter ??= RegExp(`(?:(?!${this.get_text_separators().source}|${this.src_ZPCc})${this.src_Any})`);
	}
	get_ipv4_addr() {
		return this.cache.src_ip4 ??= /* @__PURE__ */ RegExp("(?:(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])[.]){3}(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])");
	}
	get_ipv6_addr() {
		let e = "[0-9A-Fa-f]{1,4}", t = `(?:(?:${e}:${e})|${this.get_ipv4_addr().source})`;
		return this.cache.src_ip6_addr ??= RegExp(`(?:(?:${e}:){6}${t}|::(?:${e}:){5}${t}|(?:${e})?::(?:${e}:){4}${t}|(?:(?:${e}:){0,1}${e})?::(?:${e}:){3}${t}|(?:(?:${e}:){0,2}${e})?::(?:${e}:){2}${t}|(?:(?:${e}:){0,3}${e})?::${e}:${t}|(?:(?:${e}:){0,4}${e})?::${t}|(?:(?:${e}:){0,5}${e})?::${e}|(?:(?:${e}:){0,6}${e})?::)`);
	}
	get_ipv6_url_host() {
		return this.cache.src_ip6_host ??= RegExp(`\\[${this.get_ipv6_addr().source}\\]`);
	}
	get_ipv6_mail_host() {
		return this.cache.src_ipv6_mail_host ??= RegExp(`\\[IPv6:${this.get_ipv6_addr().source}\\]`);
	}
	get_auth() {
		return this.cache.src_auth ??= RegExp(`(?:(?:(?!${this.src_ZCc}|[@/\\[\\]()]).){1,50}@)?`);
	}
	get_port() {
		return this.cache.src_port ??= /* @__PURE__ */ RegExp("(?::(?:6(?:[0-4]\\d{3}|5(?:[0-4]\\d{2}|5(?:[0-2]\\d|3[0-5])))|[1-5]?\\d{1,4}))?");
	}
	get_host_terminator() {
		return this.cache.src_host_terminator ??= RegExp(`(?=$|${this.get_text_separators().source}|${this.src_ZPCc})(?!${this.opts["---"] ? "-(?!--)|" : "-|"}_|:\\d|\\.-|\\.(?!$|${this.src_ZPCc}))`);
	}
	get_path_terminator() {
		return this.cache.src_path_terminator ??= RegExp(`${this.src_ZPCc}|${this.get_text_separators().source}`);
	}
	get_path() {
		return this.cache.src_path ??= RegExp(`(?:[/?#](?:${this.nestedPairRE("[", "]")}|${this.nestedPairRE("(", ")")}|${this.nestedPairRE("{", "}")}|\\"(?:(?!${this.src_ZCc}|["]).){1,100}\\"|\\'(?:(?!${this.src_ZCc}|[']).){1,100}\\'|\\'(?=${this.get_pseudo_letter().source}|[-])|\\.{2,20}[:]?[a-zA-Z0-9%/&]|\\.(?!${this.src_ZCc}|[.]|$)|` + (this.opts["---"] ? "\\-(?!--(?:[^-]|$))(?:-{0,19})|" : "\\-{1,20}|") + `,(?!${this.src_ZCc}|$)|;(?!${this.src_ZCc}|$)|\\!{1,20}(?!${this.src_ZCc}|[!]|$)|\\?(?!${this.src_ZCc}|[?]|$)|` + this.get_path_extra().source + `[\\\\/:%@#&=_~*]|(?!${this.get_path_terminator().source}).){1,${this.opts.maxLength}}|\\/)?`);
	}
	get_mail_name() {
		return this.cache.src_mail_name ??= /* @__PURE__ */ RegExp("[-!#$%&'*+/=?^_`{|}~a-zA-Z0-9](?:[-!#$%&'*+/=?^_`{|}~a-zA-Z0-9]|[.](?=[-!#$%&'*+/=?^_`{|}~a-zA-Z0-9])){0,63}");
	}
	get_xn() {
		return this.cache.src_xn ??= /* @__PURE__ */ RegExp("xn--[a-z0-9\\-]{1,59}");
	}
	get_tld() {
		if (this.cache.tld) return this.cache.tld;
		let e = [...new Set(this.opts.tlds || [])].sort().reverse().join("|");
		return this.cache.tld = RegExp(`${e || "$#none#$"}|${this.get_xn().source}`), this.cache.tld;
	}
	get_domain_root() {
		return this.cache.src_domain_root ??= RegExp("(?:" + this.get_xn().source + `|${this.get_pseudo_letter().source}{1,63})`);
	}
	get_domain() {
		return this.cache.src_domain ??= RegExp("(?:" + this.get_xn().source + `|(?:${this.get_pseudo_letter().source})|(?:${this.get_pseudo_letter().source}(?:-|${this.get_pseudo_letter().source}){0,61}${this.get_pseudo_letter().source}))`);
	}
	get_url_host_port() {
		return this.cache.url_host_port ??= RegExp("(?:" + this.get_ipv6_url_host().source + `|(?:(?:(?:${this.get_domain().source})\\.){0,10}${this.get_domain().source}))` + this.get_port().source + this.get_host_terminator().source);
	}
	get_fuzzy_url_host_port() {
		return this.cache.fuzzy_url_host_port ??= RegExp("(?:" + (this.opts.fuzzyIP ? this.get_ipv4_addr().source + "|" : "") + `(?:(?:(?:${this.get_domain().source})\\.){1,10}(?:${this.get_tld().source})))` + this.get_host_terminator().source);
	}
	get_mail_host() {
		return this.cache.src_mail_host ??= RegExp("(?:" + this.get_ipv6_mail_host().source + `|(?:(?:(?:${this.get_domain().source})\\.){0,4}${this.get_domain().source}))` + this.get_host_terminator().source);
	}
	get_fuzzy_mail_host() {
		return this.cache.src_fuzzy_mail_host ??= RegExp("(?:" + this.get_ipv6_mail_host().source + `|(?:(?:(?:${this.get_domain().source})[.]){1,4}${this.get_domain_root().source}))` + this.get_host_terminator().source);
	}
	get_path_extra() {
		return this.cache.src_path_extra ??= /* @__PURE__ */ RegExp("");
	}
	get_fuzzy_mail_host_search() {
		return this.cache.mail_fuzzy_host_search ??= RegExp(`@${this.get_fuzzy_mail_host().source}`, "ig");
	}
	get_fuzzy_link_search() {
		return this.cache.link_fuzzy_search ??= RegExp(`(^|(?![.:/\\-_@])(?:[$+<=>^\`|\uff5c]|${this.src_ZPCc}))(?:(?![$+<=>^\`|\uff5c])${this.get_fuzzy_url_host_port().source}${this.get_path().source})`, "ig");
	}
	get_http_validator() {
		return this.cache.http_validator ??= RegExp("\\/\\/" + (this.opts.urlAuth ? this.get_auth().source : "") + this.get_url_host_port().source + this.get_path().source, "iy");
	}
	get_relative_proto_validator() {
		return this.cache.relative_proto_validator ??= RegExp((this.opts.urlAuth ? this.get_auth().source : "") + `(?:localhost|${this.get_ipv6_url_host().source}|(?:(?:${this.get_domain().source})[.]){1,10}${this.get_domain_root().source})` + this.get_port().source + this.get_host_terminator().source + this.get_path().source, "iy");
	}
	get_mail_name_validator() {
		return this.cache.mail_name_validator ??= RegExp(`(?:^|${this.get_text_separators().source}|"|\\(|${this.src_ZCc})(${this.get_mail_name().source})$`);
	}
	get_mailto_validator() {
		return this.cache.mailto_validator ??= RegExp(`${this.get_mail_name().source}@${this.get_mail_host().source}`, "iy");
	}
	get_schema_names() {
		return this.cache.schema_names ??= new RegExp((this.opts.schema_names || []).map((e) => this.escapeRE(e)).join("|"));
	}
	get_schema_search() {
		return this.cache.schema_search ??= RegExp(`(^|(?!_)(?:[><\uff5c]|${this.src_ZPCc}))(${this.get_schema_names().source})`, "ig");
	}
	get_schema_at_start() {
		return this.cache.schema_at_start ??= RegExp(`^${this.get_schema_search().source}`, "i");
	}
}, Y = {
	validate: (e, t, n) => {
		let r = n.re.get_http_validator();
		r.lastIndex = t;
		let i = r.exec(e);
		return i ? i[0].length : 0;
	},
	normalize: (e, t) => t.normalize(e)
}, zn = {
	"http:": Y,
	"https:": Y,
	"ftp:": Y,
	"//": {
		validate: function(e, t, n) {
			let r = n.re.get_relative_proto_validator();
			r.lastIndex = t;
			let i = r.exec(e);
			return i ? t >= 3 && e[t - 3] === ":" || t >= 3 && e[t - 3] === "/" ? 0 : i[0].length : 0;
		},
		normalize: (e, t) => t.normalize(e)
	},
	"mailto:": {
		validate: function(e, t, n) {
			let r = n.re.get_mailto_validator();
			r.lastIndex = t;
			let i = r.exec(e);
			return i ? i[0].length : 0;
		},
		normalize: (e, t) => t.normalize(e)
	}
}, X = "a:cdefgilmnoqrstuwxz|b:abdefghijmnorstvwyz|c:acdfghiklmnoruvwxyz|d:ejkmoz|e:cegrstu|f:ijkmor|g:abdefghilmnpqrstuwy|h:kmnrtu|i:delmnoqrst|j:emop|k:eghimnprwyz|l:abcikrstuvy|m:acdeghklmnopqrstuvwxyz|n:acefgilopruz|o:m|p:aefghklmnrstwy|q:a|r:eosuw|s:abcdeghijklmnortuvxyz|t:cdfghjklmnortvwz|u:agksyz|v:aceginu|w:fs|y:et|z:amw", Bn = "biz|com|edu|gov|net|org|pro|web|xxx|aero|asia|coop|info|museum|name|shop|рф";
function Vn() {
	let e = Bn.split("|");
	return X.split("|").forEach((t) => {
		let n = t.indexOf(":"), r = t.slice(0, n);
		for (let i of t.slice(n + 1)) e.push(r + i);
	}), e;
}
var Hn = {
	fuzzyLink: !1,
	fuzzyEmail: !0,
	fuzzyIP: !1,
	"---": !1,
	tlds: Vn(),
	urlAuth: !1,
	maxLength: 1e4
}, Un = class {
	schema;
	index;
	lastIndex;
	raw;
	text;
	url;
	constructor(e, t, n, r) {
		let i = e.slice(n, r);
		this.schema = t.toLowerCase(), this.index = n, this.lastIndex = r, this.raw = i, this.text = i, this.url = i;
	}
}, Wn = class {
	__opts__;
	__schemas__;
	re;
	constructor(e = {}) {
		let { rebuilder: t, ...n } = e;
		this.__opts__ = {
			...Hn,
			...n
		}, this.__schemas__ = { ...zn }, this.re = t || new Rn(), this.re.set({
			...this.__opts__,
			schema_names: Object.keys(this.__schemas__)
		});
	}
	add(e, t = null) {
		if (!t) delete this.__schemas__[e];
		else {
			let n = {
				normalize: (e, t) => t.normalize(e),
				...t
			};
			this.__schemas__[e] = n;
		}
		return this.re.set({
			...this.__opts__,
			schema_names: Object.keys(this.__schemas__)
		}), this;
	}
	set(e = {}) {
		return this.__opts__ = {
			...this.__opts__,
			...e
		}, this.re.set({
			...this.__opts__,
			schema_names: Object.keys(this.__schemas__)
		}), this;
	}
	test(e) {
		if (!e.length) return !1;
		let t, n;
		for (n = this.re.get_schema_search(), n.lastIndex = 0; (t = n.exec(e)) !== null;) if (this.testSchemaAt(e, t[2], n.lastIndex)) return !0;
		if (this.__opts__.fuzzyLink && this.__schemas__["http:"] && (n = this.re.get_fuzzy_link_search(), n.lastIndex = 0, n.exec(e) !== null)) return !0;
		if (this.__opts__.fuzzyEmail && this.__schemas__["mailto:"] && e.indexOf("@") >= 0) {
			let n = this.re.get_fuzzy_mail_host_search(), r = this.re.get_mail_name_validator();
			for (n.lastIndex = 0; (t = n.exec(e)) !== null;) {
				let n = e.slice(Math.max(0, t.index - 65), t.index);
				if (r.test(n)) return !0;
			}
		}
		return !1;
	}
	testSchemaAt(e, t, n) {
		return this.__schemas__[t.toLowerCase()] ? this.__schemas__[t.toLowerCase()].validate(e.slice(0, n + this.__opts__.maxLength), n, this) : 0;
	}
	match(e) {
		let t = [], n = this.re.get_schema_search(), r, i, a, o, s, c, l = !1, u = !1, d = !1, f = 0;
		if (!e.length) return null;
		for (n.lastIndex = 0, this.__opts__.fuzzyLink && this.__schemas__["http:"] && (r = this.re.get_fuzzy_link_search(), r.lastIndex = 0), this.__opts__.fuzzyEmail && this.__schemas__["mailto:"] && (i = this.re.get_fuzzy_mail_host_search(), i.lastIndex = 0, a = this.re.get_mail_name_validator());;) {
			let p = Math.max(f - 1, 0);
			if (i && a && !d && (!s || s.index < f)) for (i.lastIndex < p && (i.lastIndex = p);;) {
				let t = i.exec(e);
				if (!t) {
					d = !0, s = void 0;
					break;
				}
				let n = a.exec(e.slice(Math.max(0, t.index - 65), t.index));
				if (n) {
					if (s = {
						schema: "mailto:",
						index: t.index - n[1].length,
						lastIndex: t.index + t[0].length
					}, s.index >= f) break;
					i.lastIndex < p && (i.lastIndex = p);
				}
			}
			if (r && !u && (!o || o.index < f)) for (r.lastIndex < p && (r.lastIndex = p);;) {
				let t = r.exec(e);
				if (!t) {
					u = !0, o = void 0;
					break;
				}
				if (o = {
					schema: "",
					index: t.index + t[1].length,
					lastIndex: t.index + t[0].length
				}, o.index >= f) break;
				r.lastIndex < p && (r.lastIndex = p);
			}
			let m = s;
			(!m || o && (o.index < m.index || o.index === m.index && o.lastIndex > m.lastIndex)) && (m = o);
			let h;
			if (!l) for (;;) {
				if (!c) {
					n.lastIndex < p && (n.lastIndex = p);
					let t = n.exec(e);
					if (!t) {
						l = !0;
						break;
					}
					c = {
						schema: t[2],
						index: t.index + t[1].length,
						lastIndex: t.index + t[0].length
					};
				}
				if (c.index < f) {
					c = void 0;
					continue;
				}
				if (m && c.index > m.index) break;
				let t = c;
				c = void 0;
				let r = this.testSchemaAt(e, t.schema, t.lastIndex);
				if (r) {
					h = {
						schema: t.schema,
						index: t.index,
						lastIndex: t.lastIndex + r
					};
					break;
				}
			}
			let g = h;
			if ((!g || s && (s.index < g.index || s.index === g.index && s.lastIndex > g.lastIndex)) && (g = s), (!g || o && (o.index < g.index || o.index === g.index && o.lastIndex > g.lastIndex)) && (g = o), !g) break;
			g === s ? s = void 0 : g === o && (o = void 0);
			let _ = new Un(e, g.schema, g.index, g.lastIndex);
			_.schema ? this.__schemas__[_.schema].normalize(_, this) : this.normalize(_), t.push(_), f = g.lastIndex;
		}
		return t.length ? t : null;
	}
	matchAtStart(e) {
		if (!e.length) return null;
		let t = this.re.get_schema_at_start().exec(e);
		if (!t) return null;
		let n = this.testSchemaAt(e, t[2], t[0].length);
		if (!n) return null;
		let r = new Un(e, t[2], t.index + t[1].length, t.index + t[0].length + n);
		return this.__schemas__[r.schema].normalize(r, this), r;
	}
	tlds(e, t = !1) {
		return e = Array.isArray(e) ? e : [e], t ? this.__opts__.tlds = this.__opts__.tlds.concat(e) : this.__opts__.tlds = e, this.re.set({
			...this.__opts__,
			schema_names: Object.keys(this.__schemas__)
		}), this;
	}
	normalize(e) {
		e.schema || (e.url = `http://${e.url}`), e.schema === "mailto:" && !/^mailto:/i.test(e.url) && (e.url = `mailto:${e.url}`);
	}
}, Gn = 2147483647, Z = 36, Kn = 1, qn = 26, Jn = 38, Yn = 700, Xn = 72, Zn = 128, Qn = "-", $n = /^xn--/, er = /[^\0-\x7F]/, tr = /[\x2E\u3002\uFF0E\uFF61]/g, nr = {
	overflow: "Overflow: input needs wider integers to process",
	"not-basic": "Illegal input >= 0x80 (not a basic code point)",
	"invalid-input": "Invalid input"
}, rr = 35, ir = Math.floor, ar = String.fromCharCode;
function or(e) {
	throw RangeError(nr[e]);
}
function sr(e, t) {
	let n = [], r = e.length;
	for (; r--;) n[r] = t(e[r]);
	return n;
}
function cr(e, t) {
	let n = e.split("@"), r = "";
	n.length > 1 && (r = n[0] + "@", e = n[1]), e = e.replace(tr, ".");
	let i = sr(e.split("."), t).join(".");
	return r + i;
}
function lr(e) {
	let t = [], n = 0, r = e.length;
	for (; n < r;) {
		let i = e.charCodeAt(n++);
		if (i >= 55296 && i <= 56319 && n < r) {
			let r = e.charCodeAt(n++);
			(r & 64512) == 56320 ? t.push(((i & 1023) << 10) + (r & 1023) + 65536) : (t.push(i), n--);
		} else t.push(i);
	}
	return t;
}
var ur = (e) => String.fromCodePoint(...e), dr = function(e) {
	return e >= 48 && e < 58 ? 26 + (e - 48) : e >= 65 && e < 91 ? e - 65 : e >= 97 && e < 123 ? e - 97 : Z;
}, fr = function(e, t) {
	return e + 22 + 75 * (e < 26) - ((t != 0) << 5);
}, pr = function(e, t, n) {
	let r = 0;
	for (e = n ? ir(e / Yn) : e >> 1, e += ir(e / t); e > 455; r += Z) e = ir(e / rr);
	return ir(r + 36 * e / (e + Jn));
}, mr = function(e) {
	let t = [], n = e.length, r = 0, i = Zn, a = Xn, o = e.lastIndexOf(Qn);
	o < 0 && (o = 0);
	for (let n = 0; n < o; ++n) e.charCodeAt(n) >= 128 && or("not-basic"), t.push(e.charCodeAt(n));
	for (let s = o > 0 ? o + 1 : 0; s < n;) {
		let o = r;
		for (let t = 1, i = Z;; i += Z) {
			s >= n && or("invalid-input");
			let o = dr(e.charCodeAt(s++));
			o >= Z && or("invalid-input"), o > ir((Gn - r) / t) && or("overflow"), r += o * t;
			let c = i <= a ? Kn : i >= a + qn ? qn : i - a;
			if (o < c) break;
			let l = Z - c;
			t > ir(Gn / l) && or("overflow"), t *= l;
		}
		let c = t.length + 1;
		a = pr(r - o, c, o == 0), ir(r / c) > Gn - i && or("overflow"), i += ir(r / c), r %= c, t.splice(r++, 0, i);
	}
	return String.fromCodePoint(...t);
}, hr = function(e) {
	let t = [];
	e = lr(e);
	let n = e.length, r = Zn, i = 0, a = Xn;
	for (let n of e) n < 128 && t.push(ar(n));
	let o = t.length, s = o;
	for (o && t.push(Qn); s < n;) {
		let n = Gn;
		for (let t of e) t >= r && t < n && (n = t);
		let c = s + 1;
		n - r > ir((Gn - i) / c) && or("overflow"), i += (n - r) * c, r = n;
		for (let n of e) if (n < r && ++i > Gn && or("overflow"), n === r) {
			let e = i;
			for (let n = Z;; n += Z) {
				let r = n <= a ? Kn : n >= a + qn ? qn : n - a;
				if (e < r) break;
				let i = e - r, o = Z - r;
				t.push(ar(fr(r + i % o, 0))), e = ir(i / o);
			}
			t.push(ar(fr(e, 0))), a = pr(i, c, s === o), i = 0, ++s;
		}
		++i, ++r;
	}
	return t.join("");
}, gr = {
	version: "2.3.1",
	ucs2: {
		decode: lr,
		encode: ur
	},
	decode: mr,
	encode: hr,
	toASCII: function(e) {
		return cr(e, function(e) {
			return er.test(e) ? "xn--" + hr(e) : e;
		});
	},
	toUnicode: function(e) {
		return cr(e, function(e) {
			return $n.test(e) ? mr(e.slice(4).toLowerCase()) : e;
		});
	}
}, _r = Object.defineProperty, vr = (e, t) => {
	let n = {};
	for (var r in e) _r(n, r, {
		get: e[r],
		enumerable: !0
	});
	return t || _r(n, Symbol.toStringTag, { value: "Module" }), n;
}, yr = /* @__PURE__ */ vr({
	arrayReplaceAt: () => xr,
	asciiTrim: () => Ur,
	callable: () => br,
	escapeHtml: () => Pr,
	escapeRE: () => Ir,
	fromCodePoint: () => Cr,
	isMdAsciiPunct: () => Br,
	isPunctChar: () => Rr,
	isPunctCharCode: () => zr,
	isSpace: () => Q,
	isValidEntityCode: () => Sr,
	isWhiteSpace: () => Lr,
	lib: () => Wr,
	normalizeReference: () => Vr,
	unescapeAll: () => kr,
	unescapeMd: () => Or
});
function br(e) {
	let t = function(...n) {
		return Reflect.construct(e, n, new.target && new.target !== t ? new.target : e);
	};
	return Object.defineProperty(t, "name", { value: e.name }), Object.setPrototypeOf(t, e), t.prototype = e.prototype, t;
}
function xr(e, t, n) {
	return [].concat(e.slice(0, t), n, e.slice(t + 1));
}
function Sr(e) {
	return !(e >= 55296 && e <= 57343 || e >= 64976 && e <= 65007 || (e & 65535) == 65535 || (e & 65535) == 65534 || e >= 0 && e <= 8 || e === 11 || e >= 14 && e <= 31 || e >= 127 && e <= 159 || e > 1114111);
}
function Cr(e) {
	if (e > 65535) {
		e -= 65536;
		let t = 55296 + (e >> 10), n = 56320 + (e & 1023);
		return String.fromCharCode(t, n);
	}
	return String.fromCharCode(e);
}
var wr = /\\([!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~])/g, Tr = RegExp(`${wr.source}|&([a-z#][a-z0-9]{1,31});`, "gi"), Er = /^#((?:x[a-f0-9]{1,8}|[0-9]{1,8}))$/i;
function Dr(e, t) {
	if (t.charCodeAt(0) === 35 && Er.test(t)) {
		let n = t[1].toLowerCase() === "x" ? parseInt(t.slice(2), 16) : parseInt(t.slice(1), 10);
		return Sr(n) ? Cr(n) : e;
	}
	let n = Ln(e);
	return n === e ? e : n;
}
function Or(e) {
	return e.indexOf("\\") < 0 ? e : e.replace(wr, "$1");
}
function kr(e) {
	return e.indexOf("\\") < 0 && e.indexOf("&") < 0 ? e : e.replace(Tr, function(e, t, n) {
		return t || Dr(e, n);
	});
}
var Ar = /[&<>"]/, jr = /[&<>"]/g, Mr = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	"\"": "&quot;"
};
function Nr(e) {
	return Mr[e];
}
function Pr(e) {
	return Ar.test(e) ? e.replace(jr, Nr) : e;
}
var Fr = /[.?*+^$[\]\\(){}|-]/g;
function Ir(e) {
	return e.replace(Fr, "\\$&");
}
function Q(e) {
	switch (e) {
		case 9:
		case 32: return !0;
	}
	return !1;
}
function Lr(e) {
	if (e >= 8192 && e <= 8202) return !0;
	switch (e) {
		case 9:
		case 10:
		case 11:
		case 12:
		case 13:
		case 32:
		case 160:
		case 5760:
		case 8239:
		case 8287:
		case 12288: return !0;
	}
	return !1;
}
function Rr(e) {
	return fn.test(e) || pn.test(e);
}
function zr(e) {
	return Rr(Cr(e));
}
function Br(e) {
	switch (e) {
		case 33:
		case 34:
		case 35:
		case 36:
		case 37:
		case 38:
		case 39:
		case 40:
		case 41:
		case 42:
		case 43:
		case 44:
		case 45:
		case 46:
		case 47:
		case 58:
		case 59:
		case 60:
		case 61:
		case 62:
		case 63:
		case 64:
		case 91:
		case 92:
		case 93:
		case 94:
		case 95:
		case 96:
		case 123:
		case 124:
		case 125:
		case 126: return !0;
		default: return !1;
	}
}
function Vr(e) {
	return e = e.trim().replace(/\s+/g, " "), e.toLowerCase().toUpperCase();
}
function Hr(e) {
	return e === 32 || e === 9 || e === 10 || e === 13;
}
function Ur(e) {
	let t = 0;
	for (; t < e.length && Hr(e.charCodeAt(t)); t++);
	let n = e.length - 1;
	for (; n >= t && Hr(e.charCodeAt(n)); n--);
	return e.slice(t, n + 1);
}
var Wr = {
	mdurl: cn,
	ucmicro: ln
};
function Gr(e, t, n) {
	let r, i, a, o, s = e.posMax, c = e.pos;
	for (e.pos = t + 1, r = 1; e.pos < s;) {
		if (a = e.src.charCodeAt(e.pos), a === 93 && (r--, r === 0)) {
			i = !0;
			break;
		}
		if (o = e.pos, e.md.inline.skipToken(e), a === 91) {
			if (o === e.pos - 1) r++;
			else if (n) return e.pos = c, -1;
		}
	}
	let l = -1;
	return i && (l = e.pos), e.pos = c, l;
}
function Kr(e, t, n) {
	let r, i = t, a = {
		ok: !1,
		pos: 0,
		str: ""
	};
	if (e.charCodeAt(i) === 60) {
		for (i++; i < n;) {
			if (r = e.charCodeAt(i), r === 10 || r === 60) return a;
			if (r === 62) return a.pos = i + 1, a.str = kr(e.slice(t + 1, i)), a.ok = !0, a;
			r === 92 && i + 1 < n ? i += 2 : i++;
		}
		return a;
	}
	let o = 0;
	for (; i < n && (r = e.charCodeAt(i), !(r === 32 || r < 32 || r === 127));) if (r === 92 && i + 1 < n) {
		if (e.charCodeAt(i + 1) === 32) {
			i++;
			continue;
		}
		i += 2;
	} else {
		if (r === 40 && (o++, o > 32)) return a;
		if (r === 41) {
			if (o === 0) break;
			o--;
		}
		i++;
	}
	return t === i || o !== 0 || (a.str = kr(e.slice(t, i)), a.pos = i, a.ok = !0), a;
}
function qr(e, t, n, r) {
	let i, a = t, o = {
		ok: !1,
		can_continue: !1,
		pos: 0,
		str: "",
		marker: 0
	};
	if (r) o.str = r.str, o.marker = r.marker;
	else {
		if (a >= n) return o;
		let r = e.charCodeAt(a);
		if (r !== 34 && r !== 39 && r !== 40) return o;
		t++, a++, r === 40 && (r = 41), o.marker = r;
	}
	for (; a < n;) {
		if (i = e.charCodeAt(a), i === o.marker) return o.pos = a + 1, o.str += kr(e.slice(t, a)), o.ok = !0, o;
		if (i === 40 && o.marker === 41) return o;
		i === 92 && a + 1 < n && a++, a++;
	}
	return o.can_continue = !0, o.str += kr(e.slice(t, a)), o;
}
var Jr = /* @__PURE__ */ vr({
	parseLinkDestination: () => Kr,
	parseLinkLabel: () => Gr,
	parseLinkTitle: () => qr
});
function Yr(e) {
	"@babel/helpers - typeof";
	return Yr = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
		return typeof e;
	} : function(e) {
		return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
	}, Yr(e);
}
function Xr(e, t) {
	if (Yr(e) != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (Yr(r) != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
function Zr(e) {
	var t = Xr(e, "string");
	return Yr(t) == "symbol" ? t : t + "";
}
function $(e, t, n) {
	return (t = Zr(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
var Qr = class {
	constructor(e, t, n) {
		$(this, "map", null), $(this, "level", 0), $(this, "children", null), $(this, "content", ""), $(this, "markup", ""), $(this, "info", ""), $(this, "block", !1), $(this, "hidden", !1), this.type = e, this.tag = t, this.attrs = null, this.nesting = n, this.meta = null;
	}
	attrIndex(e) {
		if (!this.attrs) return -1;
		let t = this.attrs;
		for (let n = 0, r = t.length; n < r; n++) if (t[n][0] === e) return n;
		return -1;
	}
	attrPush(e) {
		this.attrs ? this.attrs.push(e) : this.attrs = [e];
	}
	attrSet(e, t) {
		let n = this.attrIndex(e), r = [e, t];
		n < 0 ? this.attrPush(r) : this.attrs[n] = r;
	}
	attrGet(e) {
		let t = this.attrIndex(e), n = null;
		return t >= 0 && (n = this.attrs[t][1]), n;
	}
	attrJoin(e, t) {
		let n = this.attrIndex(e);
		n < 0 ? this.attrPush([e, t]) : this.attrs[n][1] = `${this.attrs[n][1]} ${t}`;
	}
}, $r = class {
	constructor() {
		$(this, "__rules__", []), $(this, "__cache__", null);
	}
	__find__(e) {
		for (let t = 0; t < this.__rules__.length; t++) if (this.__rules__[t].name === e) return t;
		return -1;
	}
	__compile__() {
		let e = /* @__PURE__ */ new Set();
		this.__rules__.forEach((t) => {
			t.enabled && t.alt.forEach((t) => {
				t && e.add(t);
			});
		}), this.__cache__ = Object.create(null), this.__cache__[""] = [], this.__rules__.forEach((e) => {
			e.enabled && this.__cache__[""].push(e.fn);
		}), e.forEach((e) => {
			this.__cache__[e] = [], this.__rules__.forEach((t) => {
				t.enabled && t.alt.indexOf(e) >= 0 && this.__cache__[e].push(t.fn);
			});
		});
	}
	at(e, t, n = {}) {
		let r = this.__find__(e);
		if (r === -1) throw Error(`Parser rule not found: ${e}`);
		this.__rules__[r].fn = t, this.__rules__[r].alt = n.alt || [], this.__cache__ = null;
	}
	before(e, t, n, r = {}) {
		let i = this.__find__(e);
		if (i === -1) throw Error(`Parser rule not found: ${e}`);
		this.__rules__.splice(i, 0, {
			name: t,
			enabled: !0,
			fn: n,
			alt: r.alt || []
		}), this.__cache__ = null;
	}
	after(e, t, n, r = {}) {
		let i = this.__find__(e);
		if (i === -1) throw Error(`Parser rule not found: ${e}`);
		this.__rules__.splice(i + 1, 0, {
			name: t,
			enabled: !0,
			fn: n,
			alt: r.alt || []
		}), this.__cache__ = null;
	}
	push(e, t, n = {}) {
		this.__rules__.push({
			name: e,
			enabled: !0,
			fn: t,
			alt: n.alt || []
		}), this.__cache__ = null;
	}
	enable(e, t = !1) {
		Array.isArray(e) || (e = [e]);
		let n = [];
		return e.forEach((e) => {
			let r = this.__find__(e);
			if (r < 0) {
				if (t) return;
				throw Error(`Rules manager: invalid rule name ${e}`);
			}
			this.__rules__[r].enabled = !0, n.push(e);
		}), this.__cache__ = null, n;
	}
	enableOnly(e, t = !1) {
		Array.isArray(e) || (e = [e]), this.__rules__.forEach((e) => {
			e.enabled = !1;
		}), this.enable(e, t);
	}
	disable(e, t = !1) {
		Array.isArray(e) || (e = [e]);
		let n = [];
		return e.forEach((e) => {
			let r = this.__find__(e);
			if (r < 0) {
				if (t) return;
				throw Error(`Rules manager: invalid rule name ${e}`);
			}
			this.__rules__[r].enabled = !1, n.push(e);
		}), this.__cache__ = null, n;
	}
	getRules(e) {
		return this.__cache__ || this.__compile__(), this.__cache__[e] || [];
	}
}, ei = {};
ei.code_inline = function(e, t, n, r, i) {
	let a = e[t];
	return `<code${i.renderAttrs(a)}>${Pr(a.content)}</code>`;
}, ei.code_block = function(e, t, n, r, i) {
	let a = e[t];
	return `<pre${i.renderAttrs(a)}><code>${Pr(e[t].content)}</code></pre>\n`;
}, ei.fence = function(e, t, n, r, i) {
	let a = e[t], o = a.info ? kr(a.info).trim() : "", s = "", c = "";
	if (o) {
		let e = o.split(/(\s+)/g);
		s = e[0], c = e.slice(2).join("");
	}
	let l;
	if (l = n.highlight && n.highlight(a.content, s, c) || Pr(a.content), l.indexOf("<pre") === 0) return l + "\n";
	if (o) {
		let e = a.attrIndex("class"), t = a.attrs ? a.attrs.slice() : [];
		e < 0 ? t.push(["class", `${n.langPrefix}${s}`]) : (t[e] = [t[e][0], t[e][1]], t[e][1] += ` ${n.langPrefix}${s}`);
		let r = { attrs: t };
		return `<pre><code${i.renderAttrs(r)}>${l}</code></pre>\n`;
	}
	return `<pre><code${i.renderAttrs(a)}>${l}</code></pre>\n`;
}, ei.image = function(e, t, n, r, i) {
	let a = e[t];
	return a.attrs[a.attrIndex("alt")][1] = i.renderInlineAsText(a.children, n, r), i.renderToken(e, t, n);
}, ei.hardbreak = function(e, t, n) {
	return n.xhtmlOut ? "<br />\n" : "<br>\n";
}, ei.softbreak = function(e, t, n) {
	return n.breaks ? n.xhtmlOut ? "<br />\n" : "<br>\n" : "\n";
}, ei.text = function(e, t) {
	return Pr(e[t].content);
}, ei.html_block = function(e, t) {
	return e[t].content;
}, ei.html_inline = function(e, t) {
	return e[t].content;
};
var ti = class {
	constructor() {
		$(this, "rules", Object.assign({}, ei));
	}
	renderAttrs(e) {
		let t, n, r;
		if (!e.attrs) return "";
		for (r = "", t = 0, n = e.attrs.length; t < n; t++) r += ` ${Pr(e.attrs[t][0])}="${Pr(String(e.attrs[t][1]))}"`;
		return r;
	}
	renderToken(e, t, n) {
		let r = e[t], i = "";
		if (r.hidden) return "";
		let a = t - 1;
		for (; a >= 0 && e[a].hidden && e[a].nesting === 0;) a--;
		r.block && r.nesting !== -1 && a >= 0 && e[a].hidden && e[a].nesting === -1 && (i += "\n"), i += (r.nesting === -1 ? "</" : "<") + r.tag, i += this.renderAttrs(r), r.nesting === 0 && n.xhtmlOut && (i += " /");
		let o = !1;
		if (r.block && (o = !0, r.nesting === 1)) {
			let n = t + 1;
			for (; n < e.length && e[n].hidden && e[n].nesting === 0;) n++;
			if (n < e.length) {
				let t = e[n];
				(t.type === "inline" || t.hidden || t.nesting === -1 && t.tag === r.tag) && (o = !1);
			}
		}
		return i += o ? ">\n" : ">", i;
	}
	renderInline(e, t, n) {
		let r = "", i = this.rules;
		for (let a = 0, o = e.length; a < o; a++) {
			let o = e[a].type;
			i[o] === void 0 ? r += this.renderToken(e, a, t) : r += i[o](e, a, t, n, this);
		}
		return r;
	}
	renderInlineAsText(e, t, n) {
		let r = "";
		for (let i = 0, a = e.length; i < a; i++) switch (e[i].type) {
			case "text":
			case "code_inline":
				r += e[i].content;
				break;
			case "image":
				r += this.renderInlineAsText(e[i].children, t, n);
				break;
			case "html_inline":
			case "html_block":
				r += e[i].content;
				break;
			case "softbreak":
			case "hardbreak": r += "\n";
		}
		return r;
	}
	render(e, t, n) {
		let r = "", i = this.rules;
		for (let a = 0, o = e.length; a < o; a++) {
			let o = e[a].type;
			o === "inline" ? r += this.renderInline(e[a].children, t, n) : i[o] === void 0 ? r += this.renderToken(e, a, t) : r += i[o](e, a, t, n, this);
		}
		return r;
	}
}, ni = class {
	constructor(e, t, n) {
		$(this, "tokens", []), $(this, "inlineMode", !1), $(this, "Token", Qr), this.src = e, this.env = n, this.md = t;
	}
}, ri = /\r\n?/g, ii = /\0/g;
function ai(e) {
	let t;
	t = e.src.replace(ri, "\n"), t = t.replace(ii, "�"), e.src = t;
}
function oi(e) {
	let t;
	e.inlineMode ? (t = new e.Token("inline", "", 0), t.content = e.src, t.map = [0, 1], t.children = [], e.tokens.push(t)) : e.md.block.parse(e.src, e.md, e.env, e.tokens);
}
function si(e) {
	let t = e.tokens, n = 0;
	for (let e = 0; e < t.length; e++) t[e].type !== "reference_definition" && (e !== n && (t[n] = t[e]), n++);
	t.length !== n && (t.length = n);
}
function ci(e) {
	let t = e.tokens;
	for (let n = 0, r = t.length; n < r; n++) {
		let r = t[n];
		r.type === "inline" && e.md.inline.parse(r.content, e.md, e.env, r.children);
	}
}
function li(e) {
	return /^<a[>\s]/i.test(e);
}
function ui(e) {
	return /^<\/a\s*>/i.test(e);
}
function di(e) {
	let t = e.tokens;
	if (e.md.options.linkify) for (let n = 0, r = t.length; n < r; n++) {
		if (t[n].type !== "inline" || !e.md.linkify.test(t[n].content)) continue;
		let r = t[n].children, i = [], a = 0;
		for (let t = r.length - 1; t >= 0; t--) {
			let n = r[t];
			if (n.type === "link_close") for (t--; r[t].level !== n.level && r[t].type !== "link_open";) t--;
			else if (n.type === "html_inline" && (li(n.content) && a > 0 && a--, ui(n.content) && a++), !(a > 0) && n.type === "text" && e.md.linkify.test(n.content)) {
				let a = n.content, o = e.md.linkify.match(a), s = [], c = n.level, l = 0;
				o.length > 0 && o[0].index === 0 && t > 0 && r[t - 1].type === "text_special" && (o = o.slice(1));
				for (let t = 0; t < o.length; t++) {
					let n = o[t].url, r = e.md.normalizeLink(n);
					if (!e.md.validateLink(r)) continue;
					let i = o[t].text;
					i = o[t].schema ? o[t].schema === "mailto:" && !/^mailto:/i.test(i) ? e.md.normalizeLinkText(`mailto:${i}`).replace(/^mailto:/, "") : e.md.normalizeLinkText(i) : e.md.normalizeLinkText(`http://${i}`).replace(/^http:\/\//, "");
					let u = o[t].index;
					if (u > l) {
						let t = new e.Token("text", "", 0);
						t.content = a.slice(l, u), t.level = c, s.push(t);
					}
					let d = new e.Token("link_open", "a", 1);
					d.attrs = [["href", r]], d.level = c++, d.markup = "linkify", d.info = "auto", s.push(d);
					let f = new e.Token("text", "", 0);
					f.content = i, f.level = c, s.push(f);
					let p = new e.Token("link_close", "a", -1);
					p.level = --c, p.markup = "linkify", p.info = "auto", s.push(p), l = o[t].lastIndex;
				}
				if (l < a.length) {
					let t = new e.Token("text", "", 0);
					t.content = a.slice(l), t.level = c, s.push(t);
				}
				i.push({
					index: t,
					nodes: s
				});
			}
		}
		if (i.length > 0) {
			let e = r.length;
			for (let t of i) e += t.nodes.length - 1;
			let a = Array(e), o = 0, s = 0;
			i.reverse();
			for (let e = 0; e < r.length; e++) {
				let t = i[o];
				if (t?.index === e) {
					for (let e of t.nodes) a[s++] = e;
					o++;
				} else a[s++] = r[e];
			}
			t[n].children = a;
		}
	}
}
var fi = /\+-|\.\.|\?\?\?\?|!!!!|,,|--/, pi = /\((c|tm|r)\)/i, mi = /\((c|tm|r)\)/gi, hi = {
	c: "©",
	r: "®",
	tm: "™"
};
function gi(e, t) {
	return hi[t.toLowerCase()];
}
function _i(e) {
	let t = 0;
	for (let n = e.length - 1; n >= 0; n--) {
		let r = e[n];
		r.type === "text" && !t && (r.content = r.content.replace(mi, gi)), r.type === "link_open" && r.info === "auto" && t--, r.type === "link_close" && r.info === "auto" && t++;
	}
}
function vi(e) {
	let t = 0;
	for (let n = e.length - 1; n >= 0; n--) {
		let r = e[n];
		r.type === "text" && !t && fi.test(r.content) && (r.content = r.content.replace(/\+-/g, "±").replace(/\.{2,}/g, "…").replace(/([?!])…/g, "$1..").replace(/([?!]){4,}/g, "$1$1$1").replace(/,{2,}/g, ",").replace(/(^|[^-])---(?=[^-]|$)/gm, "$1—").replace(/(^|\s)--(?=\s|$)/gm, "$1–").replace(/(^|[^-\s])--(?=[^-\s]|$)/gm, "$1–")), r.type === "link_open" && r.info === "auto" && t--, r.type === "link_close" && r.info === "auto" && t++;
	}
}
function yi(e) {
	let t;
	if (e.md.options.typographer) for (t = e.tokens.length - 1; t >= 0; t--) e.tokens[t].type === "inline" && (pi.test(e.tokens[t].content) && _i(e.tokens[t].children), fi.test(e.tokens[t].content) && vi(e.tokens[t].children));
}
var bi = /['"]/, xi = /['"]/g, Si = "’", Ci = 1e3;
function wi(e, t, n) {
	for (; e.length > n;) {
		let n = e.pop();
		n.isSingleQuote ? t.single = n.prevSameQuoteIdx : t.double = n.prevSameQuoteIdx;
	}
}
function Ti(e, t, n, r) {
	e[t] || (e[t] = []), e[t].push({
		pos: n,
		ch: r
	});
}
function Ei(e, t) {
	let n = "", r = 0;
	t.sort((e, t) => e.pos - t.pos);
	for (let i = 0; i < t.length; i++) {
		let a = t[i];
		n += e.slice(r, a.pos) + a.ch, r = a.pos + 1;
	}
	return n + e.slice(r);
}
function Di(e, t) {
	let n, r = [], i = {
		single: -1,
		double: -1
	}, a = {};
	for (let o = 0; o < e.length; o++) {
		let s = e[o], c = e[o].level;
		for (n = r.length - 1; n >= 0 && !(r[n].level <= c); n--);
		if (wi(r, i, n + 1), s.type !== "text") continue;
		let l = s.content, u = 0, d = l.length;
		OUTER: for (; u < d;) {
			xi.lastIndex = u;
			let s = xi.exec(l);
			if (!s) break;
			let f = !0, p = !0;
			u = s.index + 1;
			let m = s[0] === "'", h = 32;
			if (s.index - 1 >= 0) h = l.charCodeAt(s.index - 1);
			else for (n = o - 1; n >= 0 && e[n].type !== "softbreak" && e[n].type !== "hardbreak"; n--) if (e[n].content) {
				h = e[n].content.charCodeAt(e[n].content.length - 1);
				break;
			}
			let g = 32;
			if (u < d) g = l.charCodeAt(u);
			else for (n = o + 1; n < e.length && e[n].type !== "softbreak" && e[n].type !== "hardbreak"; n++) if (e[n].content) {
				g = e[n].content.charCodeAt(0);
				break;
			}
			let _ = Br(h) || zr(h), v = Br(g) || zr(g), y = Lr(h), b = Lr(g);
			if (b ? f = !1 : v && (y || _ || (f = !1)), y ? p = !1 : _ && (b || v || (p = !1)), g === 34 && s[0] === "\"" && h >= 48 && h <= 57 && (p = f = !1), f && p && (f = _, p = v), !f && !p) m && Ti(a, o, s.index, Si);
			else {
				if (p && (n = m ? i.single : i.double, n >= 0 && r[n].level === c)) {
					let e = r[n], c, l;
					m ? (c = t.md.options.quotes[2], l = t.md.options.quotes[3]) : (c = t.md.options.quotes[0], l = t.md.options.quotes[1]), Ti(a, o, s.index, l), Ti(a, e.tokenIdx, e.contentPos, c), wi(r, i, n);
					continue OUTER;
				}
				if (f) {
					if (r.length >= Ci) return;
					r.push({
						tokenIdx: o,
						contentPos: s.index,
						isSingleQuote: m,
						level: c,
						prevSameQuoteIdx: m ? i.single : i.double
					}), m ? i.single = r.length - 1 : i.double = r.length - 1;
				} else p && m && Ti(a, o, s.index, Si);
			}
		}
	}
	Object.keys(a).forEach(function(t) {
		let n = Number(t);
		e[n].content = Ei(e[n].content, a[t]);
	});
}
function Oi(e) {
	if (e.md.options.typographer) for (let t = e.tokens.length - 1; t >= 0; t--) e.tokens[t].type === "inline" && bi.test(e.tokens[t].content) && Di(e.tokens[t].children, e);
}
function ki(e) {
	let t, n, r = e.length;
	for (t = 0; t < r; t++) e[t].type === "text_special" && (e[t].type = "text");
	for (t = n = 0; t < r; t++) e[t].type === "text" && t + 1 < r && e[t + 1].type === "text" ? e[t + 1].content = e[t].content + e[t + 1].content : (t !== n && (e[n] = e[t]), n++);
	t !== n && (e.length = n);
}
function Ai(e) {
	let t, n, r = e.tokens, i = r.length;
	for (let e = 0; e < i; e++) {
		if (r[e].type !== "inline") continue;
		let i = r[e].children, a = i.length;
		for (t = 0; t < a; t++) i[t].type === "text_special" && (i[t].type = "text"), i[t].children && ki(i[t].children);
		for (t = n = 0; t < a; t++) i[t].type === "text" && t + 1 < a && i[t + 1].type === "text" ? i[t + 1].content = i[t].content + i[t + 1].content : (t !== n && (i[n] = i[t]), n++);
		t !== n && (i.length = n);
	}
}
var ji = [
	["normalize", ai],
	["block", oi],
	["strip_references", si],
	["inline", ci],
	["linkify", di],
	["replacements", yi],
	["smartquotes", Oi],
	["text_join", Ai]
], Mi = class {
	constructor() {
		$(this, "ruler", new $r()), $(this, "State", ni);
		for (let e = 0; e < ji.length; e++) this.ruler.push(ji[e][0], ji[e][1]);
	}
	process(e) {
		let t = this.ruler.getRules("");
		for (let n = 0, r = t.length; n < r; n++) t[n](e);
	}
}, Ni = class {
	constructor(e, t, n, r) {
		$(this, "bMarks", []), $(this, "eMarks", []), $(this, "tShift", []), $(this, "sCount", []), $(this, "bsCount", []), $(this, "blkIndent", 0), $(this, "line", 0), $(this, "lineMax", 0), $(this, "tight", !1), $(this, "listIndent", -1), $(this, "parentType", "root"), $(this, "level", 0), $(this, "Token", Qr), this.src = e, this.md = t, this.env = n, this.tokens = r;
		let i = this.src;
		for (let e = 0, t = 0, n = 0, r = 0, a = i.length, o = !1; t < a; t++) {
			let s = i.charCodeAt(t);
			if (!o) {
				if (Q(s)) {
					n++, s === 9 ? r += 4 - r % 4 : r++;
					continue;
				}
				o = !0;
			}
			(s === 10 || t === a - 1) && (s !== 10 && t++, this.bMarks.push(e), this.eMarks.push(t), this.tShift.push(n), this.sCount.push(r), this.bsCount.push(0), o = !1, n = 0, r = 0, e = t + 1);
		}
		this.bMarks.push(i.length), this.eMarks.push(i.length), this.tShift.push(0), this.sCount.push(0), this.bsCount.push(0), this.lineMax = this.bMarks.length - 1;
	}
	push(e, t, n) {
		let r = new Qr(e, t, n);
		return r.block = !0, n < 0 && this.level--, r.level = this.level, n > 0 && this.level++, this.tokens.push(r), r;
	}
	isEmpty(e) {
		return this.bMarks[e] + this.tShift[e] >= this.eMarks[e];
	}
	skipEmptyLines(e) {
		for (let t = this.lineMax; e < t && !(this.bMarks[e] + this.tShift[e] < this.eMarks[e]); e++);
		return e;
	}
	skipSpaces(e) {
		for (let t = this.src.length; e < t && Q(this.src.charCodeAt(e)); e++);
		return e;
	}
	skipSpacesBack(e, t) {
		if (e <= t) return e;
		for (; e > t;) if (!Q(this.src.charCodeAt(--e))) return e + 1;
		return e;
	}
	skipChars(e, t) {
		for (let n = this.src.length; e < n && this.src.charCodeAt(e) === t; e++);
		return e;
	}
	skipCharsBack(e, t, n) {
		if (e <= n) return e;
		for (; e > n;) if (t !== this.src.charCodeAt(--e)) return e + 1;
		return e;
	}
	getLines(e, t, n, r) {
		if (e >= t) return "";
		let i = Array(t - e);
		for (let a = 0, o = e; o < t; o++, a++) {
			let e = 0, s = this.bMarks[o], c = s, l;
			for (l = o + 1 < t || r ? this.eMarks[o] + 1 : this.eMarks[o]; c < l && e < n;) {
				let t = this.src.charCodeAt(c);
				if (Q(t)) t === 9 ? e += 4 - (e + this.bsCount[o]) % 4 : e++;
				else if (c - s < this.tShift[o]) e++;
				else break;
				c++;
			}
			e > n ? i[a] = Array(e - n + 1).join(" ") + this.src.slice(c, l) : i[a] = this.src.slice(c, l);
		}
		return i.join("");
	}
}, Pi = 65536;
function Fi(e, t) {
	let n = e.bMarks[t] + e.tShift[t], r = e.eMarks[t];
	return e.src.slice(n, r);
}
function Ii(e) {
	let t = [], n = e.length, r = 0, i = e.charCodeAt(r), a = !1, o = 0, s = "";
	for (; r < n;) i === 124 && (a ? (s += e.substring(o, r - 1), o = r) : (t.push(s + e.substring(o, r)), s = "", o = r + 1)), a = i === 92, r++, i = e.charCodeAt(r);
	return t.push(s + e.substring(o)), t;
}
function Li(e, t, n, r) {
	if (t + 2 > n) return !1;
	let i = t + 1;
	if (e.sCount[i] < e.blkIndent || e.sCount[i] - e.blkIndent >= 4) return !1;
	let a = e.bMarks[i] + e.tShift[i];
	if (a >= e.eMarks[i]) return !1;
	let o = e.src.charCodeAt(a++);
	if (o !== 124 && o !== 45 && o !== 58 || a >= e.eMarks[i]) return !1;
	let s = e.src.charCodeAt(a++);
	if (s !== 124 && s !== 45 && s !== 58 && !Q(s) || o === 45 && Q(s)) return !1;
	for (; a < e.eMarks[i];) {
		let t = e.src.charCodeAt(a);
		if (t !== 124 && t !== 45 && t !== 58 && !Q(t)) return !1;
		a++;
	}
	let c = Fi(e, t + 1), l = c.split("|"), u = [];
	for (let e = 0; e < l.length; e++) {
		let t = l[e].trim();
		if (!t) {
			if (e === 0 || e === l.length - 1) continue;
			return !1;
		}
		if (!/^:?-+:?$/.test(t)) return !1;
		t.charCodeAt(t.length - 1) === 58 ? u.push(t.charCodeAt(0) === 58 ? "center" : "right") : t.charCodeAt(0) === 58 ? u.push("left") : u.push("");
	}
	if (c = Fi(e, t).trim(), c.indexOf("|") === -1 || e.sCount[t] - e.blkIndent >= 4) return !1;
	l = Ii(c), l.length && l[0] === "" && l.shift(), l.length && l[l.length - 1] === "" && l.pop();
	let d = l.length;
	if (d === 0 || d !== u.length) return !1;
	if (r) return !0;
	let f = e.parentType;
	e.parentType = "table";
	let p = e.md.block.ruler.getRules("blockquote"), m = e.push("table_open", "table", 1), h = [t, 0];
	m.map = h;
	let g = e.push("thead_open", "thead", 1);
	g.map = [t, t + 1];
	let _ = e.push("tr_open", "tr", 1);
	_.map = [t, t + 1];
	for (let t = 0; t < l.length; t++) {
		let n = e.push("th_open", "th", 1);
		u[t] && (n.attrs = [["style", `text-align:${u[t]}`]]);
		let r = e.push("inline", "", 0);
		r.content = l[t].trim(), r.children = [], e.push("th_close", "th", -1);
	}
	e.push("tr_close", "tr", -1), e.push("thead_close", "thead", -1);
	let v, y = 0;
	for (i = t + 2; i < n && !(e.sCount[i] < e.blkIndent); i++) {
		let r = !1;
		for (let t = 0, a = p.length; t < a; t++) if (p[t](e, i, n, !0)) {
			r = !0;
			break;
		}
		if (r || (c = Fi(e, i).trim(), !c) || e.sCount[i] - e.blkIndent >= 4 || (l = Ii(c), l.length && l[0] === "" && l.shift(), l.length && l[l.length - 1] === "" && l.pop(), y += d - l.length, y > Pi)) break;
		if (i === t + 2) {
			let n = e.push("tbody_open", "tbody", 1);
			n.map = v = [t + 2, 0];
		}
		let a = e.push("tr_open", "tr", 1);
		a.map = [i, i + 1];
		for (let t = 0; t < d; t++) {
			let n = e.push("td_open", "td", 1);
			u[t] && (n.attrs = [["style", `text-align:${u[t]}`]]);
			let r = e.push("inline", "", 0);
			r.content = l[t] ? l[t].trim() : "", r.children = [], e.push("td_close", "td", -1);
		}
		e.push("tr_close", "tr", -1);
	}
	return v && (e.push("tbody_close", "tbody", -1), v[1] = i), e.push("table_close", "table", -1), h[1] = i, e.parentType = f, e.line = i, !0;
}
function Ri(e, t, n) {
	if (e.sCount[t] - e.blkIndent < 4) return !1;
	let r = t + 1, i = r;
	for (; r < n;) if (e.isEmpty(r)) r++;
	else if (e.sCount[r] - e.blkIndent >= 4) r++, i = r;
	else break;
	e.line = i;
	let a = e.push("code_block", "code", 0);
	return a.content = e.getLines(t, i, 4 + e.blkIndent, !1) + "\n", a.map = [t, e.line], !0;
}
function zi(e, t, n, r) {
	let i = e.bMarks[t] + e.tShift[t], a = e.eMarks[t];
	if (e.sCount[t] - e.blkIndent >= 4 || i + 3 > a) return !1;
	let o = e.src.charCodeAt(i);
	if (o !== 126 && o !== 96) return !1;
	let s = i;
	i = e.skipChars(i, o);
	let c = i - s;
	if (c < 3) return !1;
	let l = e.src.slice(s, i), u = e.src.slice(i, a);
	if (o === 96 && u.indexOf(String.fromCharCode(o)) >= 0) return !1;
	if (r) return !0;
	let d = t, f = !1;
	for (; d++, !(d >= n || (i = s = e.bMarks[d] + e.tShift[d], a = e.eMarks[d], i < a && e.sCount[d] < e.blkIndent));) if (e.src.charCodeAt(i) === o && !(e.sCount[d] - e.blkIndent >= 4) && (i = e.skipChars(i, o), !(i - s < c) && (i = e.skipSpaces(i), !(i < a)))) {
		f = !0;
		break;
	}
	c = e.sCount[t], e.line = d + +!!f;
	let p = e.push("fence", "code", 0);
	return p.info = u, p.content = e.getLines(t + 1, d, c, !0), p.markup = l, p.map = [t, e.line], !0;
}
function Bi(e, t, n, r) {
	let i = e.bMarks[t] + e.tShift[t], a = e.eMarks[t], o = e.lineMax;
	if (e.sCount[t] - e.blkIndent >= 4 || e.src.charCodeAt(i) !== 62) return !1;
	if (r) return !0;
	let s = [], c = [], l = [], u = [], d = e.md.block.ruler.getRules("blockquote"), f = e.parentType;
	e.parentType = "blockquote";
	let p = !1, m;
	for (m = t; m < n; m++) {
		let t = e.sCount[m] < e.blkIndent;
		if (i = e.bMarks[m] + e.tShift[m], a = e.eMarks[m], i >= a) break;
		if (e.src.charCodeAt(i++) === 62 && !t) {
			let t = e.sCount[m] + 1, n, r;
			e.src.charCodeAt(i) === 32 ? (i++, t++, r = !1, n = !0) : e.src.charCodeAt(i) === 9 ? (n = !0, (e.bsCount[m] + t) % 4 == 3 ? (i++, t++, r = !1) : r = !0) : n = !1;
			let o = t;
			for (s.push(e.bMarks[m]), e.bMarks[m] = i; i < a;) {
				let t = e.src.charCodeAt(i);
				if (Q(t)) t === 9 ? o += 4 - (o + e.bsCount[m] + +!!r) % 4 : o++;
				else break;
				i++;
			}
			p = i >= a, c.push(e.bsCount[m]), e.bsCount[m] = e.sCount[m] + 1 + +!!n, l.push(e.sCount[m]), e.sCount[m] = o - t, u.push(e.tShift[m]), e.tShift[m] = i - e.bMarks[m];
			continue;
		}
		if (p) break;
		let r = !1;
		for (let t = 0, i = d.length; t < i; t++) if (d[t](e, m, n, !0)) {
			r = !0;
			break;
		}
		if (r) {
			e.lineMax = m, e.blkIndent !== 0 && (s.push(e.bMarks[m]), c.push(e.bsCount[m]), u.push(e.tShift[m]), l.push(e.sCount[m]), e.sCount[m] -= e.blkIndent);
			break;
		}
		s.push(e.bMarks[m]), c.push(e.bsCount[m]), u.push(e.tShift[m]), l.push(e.sCount[m]), e.sCount[m] = -1;
	}
	let h = e.blkIndent;
	e.blkIndent = 0;
	let g = e.push("blockquote_open", "blockquote", 1);
	g.markup = ">";
	let _ = [t, 0];
	g.map = _, e.md.block.tokenize(e, t, m);
	let v = e.push("blockquote_close", "blockquote", -1);
	v.markup = ">", e.lineMax = o, e.parentType = f, _[1] = e.line;
	for (let n = 0; n < u.length; n++) e.bMarks[n + t] = s[n], e.tShift[n + t] = u[n], e.sCount[n + t] = l[n], e.bsCount[n + t] = c[n];
	return e.blkIndent = h, !0;
}
function Vi(e, t, n, r) {
	let i = e.eMarks[t];
	if (e.sCount[t] - e.blkIndent >= 4) return !1;
	let a = e.bMarks[t] + e.tShift[t], o = e.src.charCodeAt(a++);
	if (o !== 42 && o !== 45 && o !== 95) return !1;
	let s = 1;
	for (; a < i;) {
		let t = e.src.charCodeAt(a++);
		if (t !== o && !Q(t)) return !1;
		t === o && s++;
	}
	if (s < 3) return !1;
	if (r) return !0;
	e.line = t + 1;
	let c = e.push("hr", "hr", 0);
	return c.map = [t, e.line], c.markup = Array(s + 1).join(String.fromCharCode(o)), !0;
}
function Hi(e, t) {
	let n = e.eMarks[t], r = e.bMarks[t] + e.tShift[t], i = e.src.charCodeAt(r++);
	return i !== 42 && i !== 45 && i !== 43 || r < n && !Q(e.src.charCodeAt(r)) ? -1 : r;
}
function Ui(e, t) {
	let n = e.bMarks[t] + e.tShift[t], r = e.eMarks[t], i = n;
	if (i + 1 >= r) return -1;
	let a = e.src.charCodeAt(i++);
	if (a < 48 || a > 57) return -1;
	for (;;) {
		if (i >= r) return -1;
		if (a = e.src.charCodeAt(i++), a >= 48 && a <= 57) {
			if (i - n >= 10) return -1;
		} else {
			if (a === 41 || a === 46) break;
			return -1;
		}
	}
	return i < r && (a = e.src.charCodeAt(i), !Q(a)) ? -1 : i;
}
function Wi(e, t) {
	let n = e.level + 2;
	for (let r = t + 2, i = e.tokens.length - 2; r < i; r++) e.tokens[r].level === n && e.tokens[r].type === "paragraph_open" && (e.tokens[r + 2].hidden = !0, e.tokens[r].hidden = !0, r += 2);
}
function Gi(e, t, n, r) {
	let i, a, o, s, c = t, l = !0;
	if (e.sCount[c] - e.blkIndent >= 4 || e.listIndent >= 0 && e.sCount[c] - e.listIndent >= 4 && e.sCount[c] < e.blkIndent) return !1;
	let u = !1;
	r && e.parentType === "paragraph" && e.sCount[c] >= e.blkIndent && (u = !0);
	let d, f, p;
	if ((p = Ui(e, c)) >= 0) {
		if (d = !0, o = e.bMarks[c] + e.tShift[c], f = Number(e.src.slice(o, p - 1)), u && f !== 1) return !1;
	} else if ((p = Hi(e, c)) >= 0) d = !1;
	else return !1;
	if (u && e.skipSpaces(p) >= e.eMarks[c]) return !1;
	if (r) return !0;
	let m = e.src.charCodeAt(p - 1), h = e.tokens.length;
	d ? (s = e.push("ordered_list_open", "ol", 1), f !== 1 && (s.attrs = [["start", f]])) : s = e.push("bullet_list_open", "ul", 1);
	let g = [c, 0];
	s.map = g, s.markup = String.fromCharCode(m);
	let _ = !1, v = e.md.block.ruler.getRules("list"), y = e.parentType;
	for (e.parentType = "list"; c < n;) {
		a = p, i = e.eMarks[c];
		let t = e.sCount[c] + p - (e.bMarks[c] + e.tShift[c]), r = t;
		for (; a < i;) {
			let t = e.src.charCodeAt(a);
			if (t === 9) r += 4 - (r + e.bsCount[c]) % 4;
			else if (t === 32) r++;
			else break;
			a++;
		}
		let u = a, f;
		f = u >= i ? 1 : r - t, f > 4 && (f = 1);
		let h = t + f;
		s = e.push("list_item_open", "li", 1), s.markup = String.fromCharCode(m);
		let g = [c, 0];
		s.map = g, d && (s.info = e.src.slice(o, p - 1));
		let y = e.tight, b = e.tShift[c], x = e.sCount[c], S = e.listIndent;
		if (e.listIndent = e.blkIndent, e.blkIndent = h, e.tight = !0, e.tShift[c] = u - e.bMarks[c], e.sCount[c] = r, u >= i && e.isEmpty(c + 1) ? e.line = Math.min(e.line + 2, n) : e.md.block.tokenize(e, c, n), (!e.tight || _) && (l = !1), _ = e.line - c > 1 && e.isEmpty(e.line - 1), e.blkIndent = e.listIndent, e.listIndent = S, e.tShift[c] = b, e.sCount[c] = x, e.tight = y, s = e.push("list_item_close", "li", -1), s.markup = String.fromCharCode(m), c = e.line, g[1] = c, c >= n || e.sCount[c] < e.blkIndent || e.sCount[c] - e.blkIndent >= 4) break;
		let C = !1;
		for (let t = 0, r = v.length; t < r; t++) if (v[t](e, c, n, !0)) {
			C = !0;
			break;
		}
		if (C) break;
		if (d) {
			if (p = Ui(e, c), p < 0) break;
			o = e.bMarks[c] + e.tShift[c];
		} else if (p = Hi(e, c), p < 0) break;
		if (m !== e.src.charCodeAt(p - 1)) break;
	}
	return s = d ? e.push("ordered_list_close", "ol", -1) : e.push("bullet_list_close", "ul", -1), s.markup = String.fromCharCode(m), g[1] = c, e.line = c, e.parentType = y, l && Wi(e, h), !0;
}
function Ki(e, t, n, r) {
	let i = e.bMarks[t] + e.tShift[t], a = e.eMarks[t], o = t + 1;
	if (e.sCount[t] - e.blkIndent >= 4 || e.src.charCodeAt(i) !== 91) return !1;
	function s(t) {
		let n = e.lineMax;
		if (t >= n || e.isEmpty(t)) return null;
		let r = !1;
		if (e.sCount[t] - e.blkIndent > 3 && (r = !0), e.sCount[t] < 0 && (r = !0), !r) {
			let r = e.md.block.ruler.getRules("reference"), i = e.parentType;
			e.parentType = "reference";
			let a = !1;
			for (let i = 0, o = r.length; i < o; i++) if (r[i](e, t, n, !0)) {
				a = !0;
				break;
			}
			if (e.parentType = i, a) return null;
		}
		let i = e.bMarks[t] + e.tShift[t], a = e.eMarks[t];
		return e.src.slice(i, a + 1);
	}
	let c = e.src.slice(i, a + 1);
	a = c.length;
	let l = -1;
	for (i = 1; i < a; i++) {
		let e = c.charCodeAt(i);
		if (e === 91) return !1;
		if (e === 93) {
			l = i;
			break;
		}
		if (e === 10) {
			let e = s(o);
			e !== null && (c += e, a = c.length, o++);
		} else if (e === 92 && (i++, i < a && c.charCodeAt(i) === 10)) {
			let e = s(o);
			e !== null && (c += e, a = c.length, o++);
		}
	}
	if (l < 0 || c.charCodeAt(l + 1) !== 58) return !1;
	for (i = l + 2; i < a; i++) {
		let e = c.charCodeAt(i);
		if (e === 10) {
			let e = s(o);
			e !== null && (c += e, a = c.length, o++);
		} else if (!Q(e)) break;
	}
	let u = e.md.helpers.parseLinkDestination(c, i, a);
	if (!u.ok) return !1;
	let d = e.md.normalizeLink(u.str);
	if (!e.md.validateLink(d)) return !1;
	i = u.pos;
	let f = i, p = o, m = i;
	for (; i < a; i++) {
		let e = c.charCodeAt(i);
		if (e === 10) {
			let e = s(o);
			e !== null && (c += e, a = c.length, o++);
		} else if (!Q(e)) break;
	}
	let h = e.md.helpers.parseLinkTitle(c, i, a);
	for (; h.can_continue;) {
		let t = s(o);
		if (t === null) break;
		c += t, i = a, a = c.length, o++, h = e.md.helpers.parseLinkTitle(c, i, a, h);
	}
	let g;
	for (i < a && m !== i && h.ok ? (g = h.str, i = h.pos) : (g = "", i = f, o = p); i < a && Q(c.charCodeAt(i));) i++;
	if (i < a && c.charCodeAt(i) !== 10 && g) for (g = "", i = f, o = p; i < a && Q(c.charCodeAt(i));) i++;
	if (i < a && c.charCodeAt(i) !== 10) return !1;
	let _ = Vr(c.slice(1, l));
	if (!_) return !1;
	/* istanbul ignore if */
	if (r) return !0;
	e.env.references === void 0 && (e.env.references = {}), e.env.references[_] === void 0 && (e.env.references[_] = {
		title: g,
		href: d
	});
	let v = e.push("reference_definition", "", 0);
	v.map = [t, o], v.hidden = !0;
	let y = Object.create(null);
	return y.label = _, v.meta = y, e.line = o, !0;
}
var qi = /* @__PURE__ */ "address.article.aside.base.basefont.blockquote.body.caption.center.col.colgroup.dd.details.dialog.dir.div.dl.dt.fieldset.figcaption.figure.footer.form.frame.frameset.h1.h2.h3.h4.h5.h6.head.header.hr.html.iframe.legend.li.link.main.menu.menuitem.nav.noframes.ol.optgroup.option.p.param.search.section.summary.table.tbody.td.tfoot.th.thead.title.tr.track.ul".split("."), Ji = "<[A-Za-z][A-Za-z0-9\\-]*(?:\\s+[a-zA-Z_:][a-zA-Z0-9:._-]*(?:\\s*=\\s*(?:[^\"'=<>`\\x00-\\x20]+|'[^']*'|\"[^\"]*\"))?)*\\s*\\/?>", Yi = "<\\/[A-Za-z][A-Za-z0-9\\-]*\\s*>", Xi = RegExp(`^(?:${Ji}|${Yi}|<!---?>|<!--(?:[^-]|-[^-]|--[^>])*-->|<[?][\\s\\S]*?[?]>|<![A-Za-z][^>]*>|<!\\[CDATA\\[[\\s\\S]*?\\]\\]>)`), Zi = RegExp(`^(?:${Ji}|${Yi})`), Qi = [
	[
		/^<(script|pre|style|textarea)(?=(\s|>|$))/i,
		/<\/(script|pre|style|textarea)>/i,
		!0
	],
	[
		/^<!--/,
		/-->/,
		!0
	],
	[
		/^<\?/,
		/\?>/,
		!0
	],
	[
		/^<![A-Za-z]/,
		/>/,
		!0
	],
	[
		/^<!\[CDATA\[/,
		/\]\]>/,
		!0
	],
	[
		RegExp(`^</?(${qi.join("|")})(?=(\\s|/?>|$))`, "i"),
		/^$/,
		!0
	],
	[
		RegExp(`${Zi.source}\\s*$`),
		/^$/,
		!1
	]
];
function $i(e, t, n, r) {
	let i = e.bMarks[t] + e.tShift[t], a = e.eMarks[t];
	if (e.sCount[t] - e.blkIndent >= 4 || !e.md.options.html || e.src.charCodeAt(i) !== 60) return !1;
	let o = e.src.slice(i, a), s = 0;
	for (; s < Qi.length && !Qi[s][0].test(o); s++);
	if (s === Qi.length) return !1;
	if (r) return Qi[s][2];
	let c = t + 1, l = Qi[s][1].test("");
	if (!Qi[s][1].test(o)) {
		for (; c < n && !(e.sCount[c] < e.blkIndent && (l || !e.isEmpty(c))); c++) if (i = e.bMarks[c] + e.tShift[c], a = e.eMarks[c], o = e.src.slice(i, a), Qi[s][1].test(o)) {
			o.length !== 0 && c++;
			break;
		}
	}
	e.line = c;
	let u = e.push("html_block", "", 0);
	return u.map = [t, c], u.content = e.getLines(t, c, e.blkIndent, !0), !0;
}
function ea(e, t, n, r) {
	let i = e.bMarks[t] + e.tShift[t], a = e.eMarks[t];
	if (e.sCount[t] - e.blkIndent >= 4) return !1;
	let o = e.src.charCodeAt(i);
	if (o !== 35 || i >= a) return !1;
	let s = 1;
	for (o = e.src.charCodeAt(++i); o === 35 && i < a && s <= 6;) s++, o = e.src.charCodeAt(++i);
	if (s > 6 || i < a && !Q(o)) return !1;
	if (r) return !0;
	a = e.skipSpacesBack(a, i);
	let c = e.skipCharsBack(a, 35, i);
	c > i && Q(e.src.charCodeAt(c - 1)) && (a = c), e.line = t + 1;
	let l = e.push("heading_open", `h${s}`, 1);
	l.markup = "########".slice(0, s), l.map = [t, e.line];
	let u = e.push("inline", "", 0);
	u.content = Ur(e.src.slice(i, a)), u.map = [t, e.line], u.children = [];
	let d = e.push("heading_close", `h${s}`, -1);
	return d.markup = "########".slice(0, s), !0;
}
function ta(e, t, n) {
	let r = e.md.block.ruler.getRules("paragraph");
	if (e.sCount[t] - e.blkIndent >= 4) return !1;
	let i = e.parentType;
	e.parentType = "paragraph";
	let a = 0, o, s = t + 1;
	for (; s < n && !e.isEmpty(s); s++) {
		if (e.sCount[s] - e.blkIndent > 3) continue;
		if (e.sCount[s] >= e.blkIndent) {
			let t = e.bMarks[s] + e.tShift[s], n = e.eMarks[s];
			if (t < n && (o = e.src.charCodeAt(t), (o === 45 || o === 61) && (t = e.skipChars(t, o), t = e.skipSpaces(t), t >= n))) {
				a = o === 61 ? 1 : 2;
				break;
			}
		}
		if (e.sCount[s] < 0) continue;
		let t = !1;
		for (let i = 0, a = r.length; i < a; i++) if (r[i](e, s, n, !0)) {
			t = !0;
			break;
		}
		if (t) break;
	}
	if (!a) return e.parentType = i, !1;
	let c = Ur(e.getLines(t, s, e.blkIndent, !1));
	e.line = s + 1;
	let l = e.push("heading_open", `h${a}`, 1);
	l.markup = String.fromCharCode(o), l.map = [t, e.line];
	let u = e.push("inline", "", 0);
	u.content = c, u.map = [t, e.line - 1], u.children = [];
	let d = e.push("heading_close", `h${a}`, -1);
	return d.markup = String.fromCharCode(o), e.parentType = i, !0;
}
function na(e, t, n) {
	let r = e.md.block.ruler.getRules("paragraph"), i = e.parentType, a = t + 1;
	for (e.parentType = "paragraph"; a < n && !e.isEmpty(a); a++) {
		if (e.sCount[a] - e.blkIndent > 3 || e.sCount[a] < 0) continue;
		let t = !1;
		for (let i = 0, o = r.length; i < o; i++) if (r[i](e, a, n, !0)) {
			t = !0;
			break;
		}
		if (t) break;
	}
	let o = Ur(e.getLines(t, a, e.blkIndent, !1));
	e.line = a;
	let s = e.push("paragraph_open", "p", 1);
	s.map = [t, e.line];
	let c = e.push("inline", "", 0);
	return c.content = o, c.map = [t, e.line], c.children = [], e.push("paragraph_close", "p", -1), e.parentType = i, !0;
}
var ra = [
	[
		"table",
		Li,
		["paragraph", "reference"]
	],
	["code", Ri],
	[
		"fence",
		zi,
		[
			"paragraph",
			"reference",
			"blockquote",
			"list"
		]
	],
	[
		"blockquote",
		Bi,
		[
			"paragraph",
			"reference",
			"blockquote",
			"list"
		]
	],
	[
		"hr",
		Vi,
		[
			"paragraph",
			"reference",
			"blockquote",
			"list"
		]
	],
	[
		"list",
		Gi,
		[
			"paragraph",
			"reference",
			"blockquote"
		]
	],
	["reference", Ki],
	[
		"html_block",
		$i,
		[
			"paragraph",
			"reference",
			"blockquote"
		]
	],
	[
		"heading",
		ea,
		[
			"paragraph",
			"reference",
			"blockquote"
		]
	],
	["lheading", ta],
	["paragraph", na]
], ia = class {
	constructor() {
		$(this, "ruler", new $r()), $(this, "State", Ni);
		for (let e = 0; e < ra.length; e++) this.ruler.push(ra[e][0], ra[e][1], { alt: (ra[e][2] || []).slice() });
	}
	tokenize(e, t, n) {
		let r = this.ruler.getRules(""), i = r.length, a = e.md.options.maxNesting, o = t, s = !1;
		for (; o < n && (e.line = o = e.skipEmptyLines(o), !(o >= n || e.sCount[o] < e.blkIndent));) {
			if (e.level >= a) {
				e.line = n;
				break;
			}
			let t = e.line, c = !1;
			for (let a = 0; a < i; a++) if (c = r[a](e, o, n, !1), c) {
				if (t >= e.line) throw Error("block rule didn't increment state.line");
				break;
			}
			if (!c) throw Error("none of the block rules matched");
			e.tight = !s, e.isEmpty(e.line - 1) && (s = !0), o = e.line, o < n && e.isEmpty(o) && (s = !0, o++, e.line = o);
		}
	}
	parse(e, t, n, r) {
		if (!e) return;
		let i = new this.State(e, t, n, r);
		this.tokenize(i, i.line, i.lineMax);
	}
}, aa = class {
	constructor(e, t, n, r) {
		$(this, "pos", 0), $(this, "level", 0), $(this, "pending", ""), $(this, "pendingLevel", 0), $(this, "cache", {}), $(this, "backticks", {}), $(this, "backticksScanned", !1), $(this, "linkLevel", 0), $(this, "delimiters", []), $(this, "_prev_delimiters", []), $(this, "Token", Qr), this.src = e, this.env = n, this.md = t, this.tokens = r, this.tokens_meta = Array(r.length), this.posMax = this.src.length;
	}
	pushPending() {
		let e = new Qr("text", "", 0);
		return e.content = this.pending, e.level = this.pendingLevel, this.tokens.push(e), this.pending = "", e;
	}
	push(e, t, n) {
		this.pending && this.pushPending();
		let r = new Qr(e, t, n), i;
		return n < 0 && (this.level--, this.delimiters = this._prev_delimiters.pop()), r.level = this.level, n > 0 && (this.level++, this._prev_delimiters.push(this.delimiters), this.delimiters = [], i = { delimiters: this.delimiters }), this.pendingLevel = this.level, this.tokens.push(r), this.tokens_meta.push(i), r;
	}
	scanDelims(e, t) {
		let n = this.posMax, r = this.src.charCodeAt(e), i;
		if (e === 0) i = 32;
		else if (e === 1) i = this.src.charCodeAt(0), (i & 63488) == 55296 && (i = 65533);
		else if (i = this.src.charCodeAt(e - 1), (i & 64512) == 56320) {
			let t = this.src.charCodeAt(e - 2);
			i = (t & 64512) == 55296 ? 65536 + (t - 55296 << 10) + (i - 56320) : 65533;
		} else (i & 64512) == 55296 && (i = 65533);
		let a = e;
		for (; a < n && this.src.charCodeAt(a) === r;) a++;
		let o = a - e, s = a < n ? this.src.charCodeAt(a) : 32;
		if ((s & 64512) == 55296) {
			let e = this.src.charCodeAt(a + 1);
			s = (e & 64512) == 56320 ? 65536 + (s - 55296 << 10) + (e - 56320) : 65533;
		} else (s & 64512) == 56320 && (s = 65533);
		let c = Br(i) || zr(i), l = Br(s) || zr(s), u = Lr(i), d = Lr(s), f = !d && (!l || u || c), p = !u && (!c || d || l);
		return {
			can_open: f && (t || !p || c),
			can_close: p && (t || !f || l),
			length: o
		};
	}
};
function oa(e) {
	switch (e) {
		case 10:
		case 33:
		case 35:
		case 36:
		case 37:
		case 38:
		case 42:
		case 43:
		case 45:
		case 58:
		case 60:
		case 61:
		case 62:
		case 64:
		case 91:
		case 92:
		case 93:
		case 94:
		case 95:
		case 96:
		case 123:
		case 125:
		case 126: return !0;
		default: return !1;
	}
}
function sa(e, t) {
	let n = e.pos;
	for (; n < e.posMax && !oa(e.src.charCodeAt(n));) n++;
	return n !== e.pos && (t || (e.pending += e.src.slice(e.pos, n)), e.pos = n, !0);
}
function ca(e) {
	return e >= 65 && e <= 90 || e >= 97 && e <= 122;
}
function la(e) {
	return e >= 65 && e <= 90 || e >= 97 && e <= 122 || e >= 48 && e <= 57 || e === 43 || e === 45 || e === 46;
}
function ua(e, t) {
	if (!e.md.options.linkify || e.linkLevel > 0) return !1;
	let n = e.pos, r = e.posMax;
	if (n + 3 > r || e.src.charCodeAt(n) !== 58 || e.src.charCodeAt(n + 1) !== 47 || e.src.charCodeAt(n + 2) !== 47) return !1;
	let i = n - Math.min(10, e.pending.length, n), a = n;
	for (; a > i && la(e.src.charCodeAt(a - 1));) a--;
	if (a === n || !ca(e.src.charCodeAt(a))) return !1;
	let o = n - a, s = e.md.linkify.matchAtStart(e.src.slice(a));
	if (!s) return !1;
	let c = s.url;
	if (c.length <= o) return !1;
	let l = c.length;
	for (; l > 0 && c.charCodeAt(l - 1) === 42;) l--;
	l !== c.length && (c = c.slice(0, l));
	let u = e.md.normalizeLink(c);
	if (!e.md.validateLink(u)) return !1;
	if (!t) {
		e.pending = e.pending.slice(0, -o);
		let t = e.push("link_open", "a", 1);
		t.attrs = [["href", u]], t.markup = "linkify", t.info = "auto";
		let n = e.push("text", "", 0);
		n.content = e.md.normalizeLinkText(c);
		let r = e.push("link_close", "a", -1);
		r.markup = "linkify", r.info = "auto";
	}
	return e.pos += c.length - o, !0;
}
function da(e, t) {
	let n = e.pos;
	if (e.src.charCodeAt(n) !== 10) return !1;
	let r = e.pending.length - 1, i = e.posMax;
	if (!t) {
		if (r >= 0 && e.pending.charCodeAt(r) === 32) {
			if (r >= 1 && e.pending.charCodeAt(r - 1) === 32) {
				let t = r - 1;
				for (; t >= 1 && e.pending.charCodeAt(t - 1) === 32;) t--;
				e.pending = e.pending.slice(0, t), e.push("hardbreak", "br", 0);
			} else e.pending = e.pending.slice(0, -1), e.push("softbreak", "br", 0);
		} else e.push("softbreak", "br", 0);
	}
	for (n++; n < i && Q(e.src.charCodeAt(n));) n++;
	return e.pos = n, !0;
}
var fa = [];
for (let e = 0; e < 256; e++) fa.push(0);
"\\!\"#$%&'()*+,./:;<=>?@[]^_`{|}~-".split("").forEach(function(e) {
	fa[e.charCodeAt(0)] = 1;
});
function pa(e, t) {
	let n = e.pos, r = e.posMax;
	if (e.src.charCodeAt(n) !== 92 || (n++, n >= r)) return !1;
	let i = e.src.charCodeAt(n);
	if (i === 10) {
		for (t || e.push("hardbreak", "br", 0), n++; n < r && (i = e.src.charCodeAt(n), Q(i));) n++;
		return e.pos = n, !0;
	}
	if (i === 32) {
		if (!t) {
			let t = e.push("text_special", "", 0);
			t.content = "\\", t.markup = "\\", t.info = "escape";
		}
		return e.pos = n, !0;
	}
	let a = e.src[n];
	if (i >= 55296 && i <= 56319 && n + 1 < r) {
		let t = e.src.charCodeAt(n + 1);
		t >= 56320 && t <= 57343 && (a += e.src[n + 1], n++);
	}
	let o = "\\" + a;
	if (!t) {
		let t = e.push("text_special", "", 0);
		t.content = i < 256 && fa[i] !== 0 ? a : o, t.markup = o, t.info = "escape";
	}
	return e.pos = n + 1, !0;
}
function ma(e) {
	let t = {}, n = 0;
	for (; (n = e.indexOf("`", n)) !== -1;) {
		let r = n;
		for (; e.charCodeAt(++n) === 96;);
		t[n - r] = r;
	}
	return t;
}
function ha(e, t) {
	let n = e.pos;
	if (e.src.charCodeAt(n) !== 96) return !1;
	let r = e.posMax, i = n + 1;
	for (; i < r && e.src.charCodeAt(i) === 96;) i++;
	let a = e.src.slice(n, i), o = a.length;
	if (e.backticksScanned ||= (e.backticks = ma(e.src), !0), (e.backticks[o] ?? -1) >= i) {
		let n = i, s;
		for (; (s = e.src.indexOf("`", n)) !== -1 && s < r;) {
			for (n = s + 1; e.src.charCodeAt(n) === 96;) n++;
			if (n > r) break;
			if (n - s === o) {
				if (!t) {
					let t = e.push("code_inline", "code", 0);
					t.markup = a;
					let n = e.src.slice(i, s).replace(/\n/g, " ");
					n.startsWith(" ") && n.endsWith(" ") && /[^ ]/.test(n) && (n = n.slice(1, -1)), t.content = n;
				}
				return e.pos = n, !0;
			}
		}
	}
	return t || (e.pending += a), e.pos = i, !0;
}
function ga(e, t) {
	let n = e.pos, r = e.src.charCodeAt(n);
	if (t || r !== 126) return !1;
	let i = e.scanDelims(e.pos, !0), a = i.length, o = String.fromCharCode(r);
	if (a < 2) return !1;
	let s;
	a % 2 && (s = e.push("text", "", 0), s.content = o, a--);
	for (let t = 0; t < a; t += 2) s = e.push("text", "", 0), s.content = o + o, e.delimiters.push({
		marker: r,
		length: 0,
		token: e.tokens.length - 1,
		end: -1,
		open: i.can_open,
		close: i.can_close
	});
	return e.pos += i.length, !0;
}
function _a(e, t) {
	let n, r = [], i = t.length;
	for (let a = 0; a < i; a++) {
		let i = t[a];
		if (i.marker !== 126 || i.end === -1) continue;
		let o = t[i.end];
		n = e.tokens[i.token], n.type = "s_open", n.tag = "s", n.nesting = 1, n.markup = "~~", n.content = "", n = e.tokens[o.token], n.type = "s_close", n.tag = "s", n.nesting = -1, n.markup = "~~", n.content = "", e.tokens[o.token - 1].type === "text" && e.tokens[o.token - 1].content === "~" && r.push(o.token - 1);
	}
	for (; r.length;) {
		let t = r.pop(), i = t + 1;
		for (; i < e.tokens.length && e.tokens[i].type === "s_close";) i++;
		i--, t !== i && (n = e.tokens[i], e.tokens[i] = e.tokens[t], e.tokens[t] = n);
	}
}
function va(e) {
	let t = e.tokens_meta, n = e.tokens_meta.length;
	_a(e, e.delimiters);
	for (let r = 0; r < n; r++) {
		let n = t[r]?.delimiters;
		n && _a(e, n);
	}
}
var ya = {
	tokenize: ga,
	postProcess: va
};
function ba(e, t) {
	let n = e.pos, r = e.src.charCodeAt(n);
	if (t || r !== 95 && r !== 42) return !1;
	let i = e.scanDelims(e.pos, r === 42);
	for (let t = 0; t < i.length; t++) {
		let t = e.push("text", "", 0);
		t.content = String.fromCharCode(r), e.delimiters.push({
			marker: r,
			length: i.length,
			token: e.tokens.length - 1,
			end: -1,
			open: i.can_open,
			close: i.can_close
		});
	}
	return e.pos += i.length, !0;
}
function xa(e, t) {
	let n = t.length;
	for (let r = n - 1; r >= 0; r--) {
		let n = t[r];
		if (n.marker !== 95 && n.marker !== 42 || n.end === -1) continue;
		let i = t[n.end], a = r > 0 && t[r - 1].end === n.end + 1 && t[r - 1].marker === n.marker && t[r - 1].token === n.token - 1 && t[n.end + 1].token === i.token + 1, o = String.fromCharCode(n.marker), s = e.tokens[n.token];
		s.type = a ? "strong_open" : "em_open", s.tag = a ? "strong" : "em", s.nesting = 1, s.markup = a ? o + o : o, s.content = "";
		let c = e.tokens[i.token];
		c.type = a ? "strong_close" : "em_close", c.tag = a ? "strong" : "em", c.nesting = -1, c.markup = a ? o + o : o, c.content = "", a && (e.tokens[t[r - 1].token].content = "", e.tokens[t[n.end + 1].token].content = "", r--);
	}
}
function Sa(e) {
	let t = e.tokens_meta, n = e.tokens_meta.length;
	xa(e, e.delimiters);
	for (let r = 0; r < n; r++) {
		let n = t[r]?.delimiters;
		n && xa(e, n);
	}
}
var Ca = {
	tokenize: ba,
	postProcess: Sa
};
function wa(e, t) {
	let n, r, i, a, o = "", s = "", c = e.pos, l = !0;
	if (e.src.charCodeAt(e.pos) !== 91) return !1;
	let u = e.pos, d = e.posMax, f = e.pos + 1, p = e.md.helpers.parseLinkLabel(e, e.pos, !0);
	if (p < 0) return !1;
	let m = p + 1;
	if (m < d && e.src.charCodeAt(m) === 40) {
		for (l = !1, m++; m < d && (n = e.src.charCodeAt(m), Q(n) || n === 10); m++);
		if (m >= d) return !1;
		if (c = m, i = e.md.helpers.parseLinkDestination(e.src, m, e.posMax), i.ok) {
			for (o = e.md.normalizeLink(i.str), e.md.validateLink(o) ? m = i.pos : o = "", c = m; m < d && (n = e.src.charCodeAt(m), Q(n) || n === 10); m++);
			if (i = e.md.helpers.parseLinkTitle(e.src, m, e.posMax), m < d && c !== m && i.ok) for (s = i.str, m = i.pos; m < d && (n = e.src.charCodeAt(m), Q(n) || n === 10); m++);
		}
		(m >= d || e.src.charCodeAt(m) !== 41) && (l = !0), m++;
	}
	if (l) {
		if (e.env.references === void 0) return !1;
		if (m < d && e.src.charCodeAt(m) === 91 ? (c = m + 1, m = e.md.helpers.parseLinkLabel(e, m), m >= 0 ? r = e.src.slice(c, m++) : m = p + 1) : m = p + 1, r ||= e.src.slice(f, p), r = Vr(r), a = e.env.references[r], !a) return e.pos = u, !1;
		o = a.href, s = a.title;
	}
	if (!t) {
		e.pos = f, e.posMax = p;
		let t = e.push("link_open", "a", 1), n = [["href", o]];
		if (t.attrs = n, s && n.push(["title", s]), r) {
			let e = Object.create(null);
			e.label = r, t.meta = e;
		}
		e.linkLevel++, e.md.inline.tokenize(e), e.linkLevel--, e.push("link_close", "a", -1);
	}
	return e.pos = m, e.posMax = d, !0;
}
function Ta(e, t) {
	let n, r, i, a, o, s, c, l, u = "", d = e.pos, f = e.posMax;
	if (e.src.charCodeAt(e.pos) !== 33 || e.src.charCodeAt(e.pos + 1) !== 91) return !1;
	let p = e.pos + 2, m = e.md.helpers.parseLinkLabel(e, e.pos + 1, !1);
	if (m < 0) return !1;
	if (a = m + 1, a < f && e.src.charCodeAt(a) === 40) {
		for (a++; a < f && (n = e.src.charCodeAt(a), Q(n) || n === 10); a++);
		if (a >= f) return !1;
		for (l = a, s = e.md.helpers.parseLinkDestination(e.src, a, e.posMax), s.ok && (u = e.md.normalizeLink(s.str), e.md.validateLink(u) ? a = s.pos : u = ""), l = a; a < f && (n = e.src.charCodeAt(a), Q(n) || n === 10); a++);
		if (s = e.md.helpers.parseLinkTitle(e.src, a, e.posMax), a < f && l !== a && s.ok) for (c = s.str, a = s.pos; a < f && (n = e.src.charCodeAt(a), Q(n) || n === 10); a++);
		else c = "";
		if (a >= f || e.src.charCodeAt(a) !== 41) return e.pos = d, !1;
		a++;
	} else {
		if (e.env.references === void 0) return !1;
		if (a < f && e.src.charCodeAt(a) === 91 ? (l = a + 1, a = e.md.helpers.parseLinkLabel(e, a), a >= 0 ? i = e.src.slice(l, a++) : a = m + 1) : a = m + 1, i ||= e.src.slice(p, m), i = Vr(i), o = e.env.references[i], !o) return e.pos = d, !1;
		u = o.href, c = o.title;
	}
	if (!t) {
		r = e.src.slice(p, m);
		let t = [];
		e.md.inline.parse(r, e.md, e.env, t);
		let n = e.push("image", "img", 0), a = [["src", u], ["alt", ""]];
		if (n.attrs = a, n.children = t, n.content = r, c && a.push(["title", c]), i) {
			let e = Object.create(null);
			e.label = i, n.meta = e;
		}
	}
	return e.pos = a, e.posMax = f, !0;
}
var Ea = /^([a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)$/, Da = /^([a-zA-Z][a-zA-Z0-9+.-]{1,31}):([^<>\x00-\x20]*)$/;
function Oa(e, t) {
	let n = e.pos;
	if (e.src.charCodeAt(n) !== 60) return !1;
	let r = e.pos, i = e.posMax;
	for (;;) {
		if (++n >= i) return !1;
		let t = e.src.charCodeAt(n);
		if (t === 60) return !1;
		if (t === 62) break;
	}
	let a = e.src.slice(r + 1, n);
	if (Da.test(a)) {
		let n = e.md.normalizeLink(a);
		if (!e.md.validateLink(n)) return !1;
		if (!t) {
			let t = e.push("link_open", "a", 1);
			t.attrs = [["href", n]], t.markup = "autolink", t.info = "auto";
			let r = e.push("text", "", 0);
			r.content = e.md.normalizeLinkText(a);
			let i = e.push("link_close", "a", -1);
			i.markup = "autolink", i.info = "auto";
		}
		return e.pos += a.length + 2, !0;
	}
	if (Ea.test(a)) {
		let n = e.md.normalizeLink(`mailto:${a}`);
		if (!e.md.validateLink(n)) return !1;
		if (!t) {
			let t = e.push("link_open", "a", 1);
			t.attrs = [["href", n]], t.markup = "autolink", t.info = "auto";
			let r = e.push("text", "", 0);
			r.content = e.md.normalizeLinkText(a);
			let i = e.push("link_close", "a", -1);
			i.markup = "autolink", i.info = "auto";
		}
		return e.pos += a.length + 2, !0;
	}
	return !1;
}
function ka(e) {
	return /^<a[>\s]/i.test(e);
}
function Aa(e) {
	return /^<\/a\s*>/i.test(e);
}
function ja(e) {
	let t = e | 32;
	return t >= 97 && t <= 122;
}
function Ma(e, t) {
	if (!e.md.options.html) return !1;
	let n = e.posMax, r = e.pos;
	if (e.src.charCodeAt(r) !== 60 || r + 2 >= n) return !1;
	let i = e.src.charCodeAt(r + 1);
	if (i !== 33 && i !== 63 && i !== 47 && !ja(i)) return !1;
	let a = e.src.slice(r).match(Xi);
	if (!a) return !1;
	if (!t) {
		let t = e.push("html_inline", "", 0);
		t.content = a[0], ka(t.content) && e.linkLevel++, Aa(t.content) && e.linkLevel--;
	}
	return e.pos += a[0].length, !0;
}
var Na = /^&#((?:x[a-f0-9]{1,6}|[0-9]{1,7}));/i, Pa = /^&([a-z][a-z0-9]{1,31});/i;
function Fa(e, t) {
	let n = e.pos, r = e.posMax;
	if (e.src.charCodeAt(n) !== 38 || n + 1 >= r) return !1;
	if (e.src.charCodeAt(n + 1) === 35) {
		let r = e.src.slice(n).match(Na);
		if (r) {
			if (!t) {
				let t = r[1][0].toLowerCase() === "x" ? parseInt(r[1].slice(1), 16) : parseInt(r[1], 10), n = e.push("text_special", "", 0);
				n.content = Sr(t) ? Cr(t) : Cr(65533), n.markup = r[0], n.info = "entity";
			}
			return e.pos += r[0].length, !0;
		}
	} else {
		let r = e.src.slice(n).match(Pa);
		if (r) {
			let n = Ln(r[0]);
			if (n !== r[0]) {
				if (!t) {
					let t = e.push("text_special", "", 0);
					t.content = n, t.markup = r[0], t.info = "entity";
				}
				return e.pos += r[0].length, !0;
			}
		}
	}
	return !1;
}
function Ia(e) {
	let t = {}, n = e.length;
	if (!n) return;
	let r = 0, i = -2, a = [];
	for (let o = 0; o < n; o++) {
		let n = e[o];
		if (a.push(0), (e[r].marker !== n.marker || i !== n.token - 1) && (r = o), i = n.token, n.length = n.length || 0, !n.close) continue;
		t.hasOwnProperty(n.marker) || (t[n.marker] = [
			-1,
			-1,
			-1,
			-1,
			-1,
			-1
		]);
		let s = t[n.marker][(n.open ? 3 : 0) + n.length % 3], c = r - a[r] - 1, l = c;
		for (; c > s; c -= a[c] + 1) {
			let t = e[c];
			if (t.marker === n.marker && t.open && t.end < 0) {
				let r = !1;
				if ((t.close || n.open) && (t.length + n.length) % 3 == 0 && (t.length % 3 != 0 || n.length % 3 != 0) && (r = !0), !r) {
					let r = c > 0 && !e[c - 1].open ? a[c - 1] + 1 : 0;
					a[o] = o - c + r, a[c] = r, n.open = !1, t.end = o, t.close = !1, l = -1, i = -2;
					break;
				}
			}
		}
		l !== -1 && (t[n.marker][(n.open ? 3 : 0) + (n.length || 0) % 3] = l);
	}
}
function La(e) {
	let t = e.tokens_meta, n = e.tokens_meta.length;
	Ia(e.delimiters);
	for (let e = 0; e < n; e++) {
		let n = t[e]?.delimiters;
		n && Ia(n);
	}
}
function Ra(e) {
	let t, n, r = 0, i = e.tokens, a = e.tokens.length;
	for (t = n = 0; t < a; t++) i[t].nesting < 0 && r--, i[t].level = r, i[t].nesting > 0 && r++, i[t].type === "text" && t + 1 < a && i[t + 1].type === "text" ? i[t + 1].content = i[t].content + i[t + 1].content : (t !== n && (i[n] = i[t]), n++);
	t !== n && (i.length = n);
}
var za = [
	["text", sa],
	["linkify", ua],
	["newline", da],
	["escape", pa],
	["backticks", ha],
	["strikethrough", ya.tokenize],
	["emphasis", Ca.tokenize],
	["link", wa],
	["image", Ta],
	["autolink", Oa],
	["html_inline", Ma],
	["entity", Fa]
], Ba = [
	["balance_pairs", La],
	["strikethrough", ya.postProcess],
	["emphasis", Ca.postProcess],
	["fragments_join", Ra]
], Va = class {
	constructor() {
		$(this, "ruler", new $r()), $(this, "ruler2", new $r()), $(this, "State", aa);
		for (let e = 0; e < za.length; e++) this.ruler.push(za[e][0], za[e][1]);
		for (let e = 0; e < Ba.length; e++) this.ruler2.push(Ba[e][0], Ba[e][1]);
	}
	skipToken(e) {
		let t = e.pos, n = this.ruler.getRules(""), r = n.length, i = e.md.options.maxNesting, a = e.cache;
		if (a[t] !== void 0) {
			e.pos = a[t];
			return;
		}
		let o = !1;
		if (e.level < i) {
			for (let i = 0; i < r; i++) if (e.level++, o = n[i](e, !0), e.level--, o) {
				if (t >= e.pos) throw Error("inline rule didn't increment state.pos");
				break;
			}
		} else e.pos = e.posMax;
		o || e.pos++, a[t] = e.pos;
	}
	tokenize(e) {
		let t = this.ruler.getRules(""), n = t.length, r = e.posMax, i = e.md.options.maxNesting;
		for (; e.pos < r;) {
			let a = e.pos, o = !1;
			if (e.level < i) {
				for (let r = 0; r < n; r++) if (o = t[r](e, !1), o) {
					if (a >= e.pos) throw Error("inline rule didn't increment state.pos");
					break;
				}
			}
			if (o) {
				if (e.pos >= r) break;
			} else e.pending += e.src[e.pos++];
		}
		e.pending && e.pushPending();
	}
	parse(e, t, n, r) {
		let i = new this.State(e, t, n, r);
		this.tokenize(i);
		let a = this.ruler2.getRules(""), o = a.length;
		for (let e = 0; e < o; e++) a[e](i);
	}
}, Ha = {
	default: {
		options: {
			html: !1,
			xhtmlOut: !1,
			breaks: !1,
			langPrefix: "language-",
			linkify: !1,
			typographer: !1,
			quotes: "“”‘’",
			highlight: null,
			maxNesting: 100
		},
		components: {
			core: {},
			block: {},
			inline: {}
		}
	},
	zero: {
		options: {
			html: !1,
			xhtmlOut: !1,
			breaks: !1,
			langPrefix: "language-",
			linkify: !1,
			typographer: !1,
			quotes: "“”‘’",
			highlight: null,
			maxNesting: 20
		},
		components: {
			core: { rules: [
				"normalize",
				"block",
				"strip_references",
				"inline",
				"text_join"
			] },
			block: { rules: ["paragraph"] },
			inline: {
				rules: ["text"],
				rules2: ["balance_pairs", "fragments_join"]
			}
		}
	},
	commonmark: {
		options: {
			html: !0,
			xhtmlOut: !0,
			breaks: !1,
			langPrefix: "language-",
			linkify: !1,
			typographer: !1,
			quotes: "“”‘’",
			highlight: null,
			maxNesting: 20
		},
		components: {
			core: { rules: [
				"normalize",
				"block",
				"strip_references",
				"inline",
				"text_join"
			] },
			block: { rules: [
				"blockquote",
				"code",
				"fence",
				"heading",
				"hr",
				"html_block",
				"lheading",
				"list",
				"reference",
				"paragraph"
			] },
			inline: {
				rules: [
					"autolink",
					"backticks",
					"emphasis",
					"entity",
					"escape",
					"html_inline",
					"image",
					"link",
					"newline",
					"text"
				],
				rules2: [
					"balance_pairs",
					"emphasis",
					"fragments_join"
				]
			}
		}
	}
}, Ua = /^(vbscript|javascript|file|data):/, Wa = /^data:image\/(gif|png|jpeg|webp);/, Ga = [
	"http:",
	"https:",
	"mailto:"
], Ka = class {
	validateLink(e) {
		let t = e.trim().toLowerCase();
		return !Ua.test(t) || Wa.test(t);
	}
	normalizeLink(e) {
		let t = sn(e, !0);
		if (t.hostname && (!t.protocol || Ga.indexOf(t.protocol) >= 0)) try {
			t.hostname = gr.toASCII(t.hostname);
		} catch {}
		return t.auth &&= U(t.auth), t.hostname &&= U(t.hostname), t.pathname &&= U(t.pathname), t.search &&= U(t.search), t.hash &&= U(t.hash), Yt(t);
	}
	normalizeLinkText(e) {
		let t = sn(e, !0);
		if (t.hostname && (!t.protocol || Ga.indexOf(t.protocol) >= 0)) try {
			t.hostname = gr.toUnicode(t.hostname);
		} catch {}
		return H(Yt(t), H.defaultChars + "%");
	}
	constructor(...e) {
		$(this, "inline", new Va()), $(this, "block", new ia()), $(this, "core", new Mi()), $(this, "renderer", new ti()), $(this, "linkify", new Wn()), $(this, "utils", yr), $(this, "helpers", Object.assign({}, Jr));
		let [t, n] = e;
		typeof t == "string" ? (this.configure(t), n && this.set(n)) : (this.configure("default"), this.set(t || {}));
	}
	set(e) {
		return Object.assign(this.options, e), this;
	}
	configure(e) {
		let t;
		if (typeof e == "string") {
			let n = e;
			if (t = Ha[n], !t) throw Error(`Wrong 'markdown-it' preset "${n}", check name`);
		} else t = e;
		if (!t) throw Error("Wrong `markdown-it` preset, can't be empty");
		t.options && (this.options = { ...t.options });
		let n = t.components;
		if (n) {
			[
				"core",
				"block",
				"inline"
			].forEach((e) => {
				let t = n[e]?.rules;
				t && this[e].ruler.enableOnly(t);
			});
			let e = n.inline?.rules2;
			e && this.inline.ruler2.enableOnly(e);
		}
		return this;
	}
	enable(e, t = !1) {
		let n = [];
		Array.isArray(e) || (e = [e]), [
			"core",
			"block",
			"inline"
		].forEach((t) => {
			n = n.concat(this[t].ruler.enable(e, !0));
		}), n = n.concat(this.inline.ruler2.enable(e, !0));
		let r = e.filter((e) => n.indexOf(e) < 0);
		if (r.length && !t) throw Error(`MarkdownIt. Failed to enable unknown rule(s): ${r}`);
		return this;
	}
	disable(e, t = !1) {
		let n = [];
		Array.isArray(e) || (e = [e]), [
			"core",
			"block",
			"inline"
		].forEach((t) => {
			n = n.concat(this[t].ruler.disable(e, !0));
		}), n = n.concat(this.inline.ruler2.disable(e, !0));
		let r = e.filter((e) => n.indexOf(e) < 0);
		if (r.length && !t) throw Error(`MarkdownIt. Failed to disable unknown rule(s): ${r}`);
		return this;
	}
	use(e, ...t) {
		return e.apply(e, [this, ...t]), this;
	}
	parse(e, t) {
		if (typeof e != "string") throw Error("Input data should be a String");
		let n = new this.core.State(e, this, t);
		return this.core.process(n), n.tokens;
	}
	render(e, t = {}) {
		return this.renderer.render(this.parse(e, t), this.options, t);
	}
	parseInline(e, t) {
		let n = new this.core.State(e, this, t);
		return n.inlineMode = !0, this.core.process(n), n.tokens;
	}
	renderInline(e, t = {}) {
		return this.renderer.render(this.parseInline(e, t), this.options, t);
	}
};
$(Ka, "Token", Qr), $(Ka, "Ruler", $r), $(Ka, "Renderer", ti), $(Ka, "ParserCore", Mi), $(Ka, "StateCore", ni), $(Ka, "ParserBlock", ia), $(Ka, "StateBlock", Ni), $(Ka, "ParserInline", Va), $(Ka, "StateInline", aa);
//#endregion
//#region ../markdown/src/render.ts
var qa = new (br(Ka))({
	html: !1,
	linkify: !0,
	typographer: !0
});
function Ja(e, t = document) {
	let n = t.createElement("div");
	n.className = "pv-md", n.innerHTML = Wt(t.defaultView).sanitize(qa.render(e), { USE_PROFILES: { html: !0 } });
	for (let e of n.querySelectorAll("a")) e.target = "_blank", e.rel = "noopener noreferrer";
	return n;
}
//#endregion
//#region ../typeset/src/nodes.ts
var Ya = 1e4, Xa = 1e5, Za = (e, t) => ({
	type: "box",
	width: e,
	text: t
}), Qa = (e, t, n) => ({
	type: "glue",
	width: e,
	stretch: t,
	shrink: n
}), $a = (e, t, n = !1, r = "") => ({
	type: "penalty",
	width: e,
	penalty: t,
	flagged: n,
	text: r
}), eo = (e) => e !== void 0 && e.type === "penalty" && e.penalty <= -1e4, to = {
	tolerance: 1,
	linePenalty: 10,
	flaggedDemerits: 3e3,
	fitnessDemerits: 3e3,
	finalHyphenDemerits: 5e3,
	emergencyStretch: 0
};
function no(e, t) {
	let n = t + 1;
	for (; n < e.length;) {
		let t = e[n];
		if (t.type === "box" || eo(t)) break;
		n++;
	}
	return n;
}
var ro = 1e4;
function io(e) {
	return e < -.5 ? 0 : e <= .5 ? 1 : e <= 1 ? 2 : 3;
}
function ao(e, t, n = {}) {
	let r = {
		...to,
		...n
	}, i = e.length;
	if (i === 0 || t.length === 0) return [];
	let a = new Float64Array(i + 1), o = new Float64Array(i + 1), s = new Float64Array(i + 1);
	for (let t = 0; t < i; t++) {
		let n = e[t];
		a[t + 1] = a[t] + (n.type === "penalty" ? 0 : n.width), o[t + 1] = o[t] + (n.type === "glue" ? n.stretch : 0), s[t + 1] = s[t] + (n.type === "glue" ? n.shrink : 0);
	}
	let c = (t) => no(e, t), l = (e) => t[Math.min(e, t.length - 1)], u = t.length - 1, d = (t) => {
		let n = e[t];
		return n !== void 0 && n.type === "penalty" && n.flagged;
	}, f = [{
		position: -1,
		start: 0,
		line: 0,
		fitness: 1,
		total: 0,
		prev: null
	}];
	for (let t = 0; t < i; t++) {
		let n = e[t];
		if (!(n.type === "penalty" ? n.penalty < 1e4 : n.type === "glue" && t > 0 && e[t - 1].type === "box")) continue;
		let i = eo(n), p = n.type === "penalty" ? n.width : 0, m = n.type === "penalty" ? n.penalty : 0, h = /* @__PURE__ */ new Map(), g = [];
		for (let e of f) {
			let n = e.start, c = a[t] - a[n] + p, f = l(e.line), _;
			if (c < f) {
				let e = o[t] - o[n] + r.emergencyStretch;
				_ = e > 0 ? (f - c) / e : Infinity;
			} else if (c > f) {
				let e = s[t] - s[n];
				_ = e > 0 ? (f - c) / e : -Infinity;
			} else _ = 0;
			if (_ >= -1 && _ <= r.tolerance) {
				let n = Math.min(100 * Math.abs(_) ** 3, ro), a = (r.linePenalty + n) ** 2;
				m >= 0 ? a += m * m : m > -1e4 && (a -= m * m), d(t) && d(e.position) && (a += r.flaggedDemerits), i && d(e.position) && (a += r.finalHyphenDemerits);
				let o = io(_);
				Math.abs(o - e.fitness) > 1 && (a += r.fitnessDemerits);
				let s = `${Math.min(e.line + 1, u)}|${o}`, c = e.total + a, l = h.get(s);
				(!l || c < l.total) && h.set(s, {
					position: t,
					start: 0,
					line: e.line + 1,
					fitness: o,
					total: c,
					prev: e
				});
			}
			_ < -1 || i || g.push(e);
		}
		if (h.size > 0) {
			let e = c(t);
			for (let t of h.values()) t.start = e, g.push(t);
		}
		if (g.length === 0) return null;
		f = g;
	}
	let p = null;
	for (let e of f) e.position === i - 1 && (!p || e.total < p.total) && (p = e);
	if (!p) return null;
	let m = [];
	for (let e = p; e && e.prev; e = e.prev) m.push({
		position: e.position,
		ratio: h(e.prev, e.position)
	});
	return m.reverse();
	function h(t, n) {
		let r = e[n], i = a[n] - a[t.start] + (r.type === "penalty" ? r.width : 0), c = l(t.line);
		if (i < c) {
			let e = o[n] - o[t.start];
			return e > 0 ? (c - i) / e : Infinity;
		}
		if (i > c) {
			let e = s[n] - s[t.start];
			return e > 0 ? (c - i) / e : -Infinity;
		}
		return 0;
	}
}
function oo(e, t) {
	let n = [], r = 0, i = 0, a = 0, o = -1, s = !1, c = (e, t) => {
		n.push({
			position: e,
			ratio: 0
		}), r++, i = t, o = -1;
	};
	for (let n = 0; n < e.length; n++) {
		let l = e[n], u = t[Math.min(r, t.length - 1)] ?? Infinity;
		l.type === "box" ? (s && i + l.width > u && o >= 0 && c(o, a), i += l.width, a += l.width, s = !0) : l.type === "glue" ? (n > 0 && e[n - 1].type === "box" ? (o = n, a = 0) : a += l.width, s && (i += l.width)) : eo(l) ? (c(n, 0), a = 0, s = !1) : l.penalty < 1e4 && (o = n, a = 0);
	}
	return n;
}
//#endregion
//#region ../typeset/src/format.ts
var so = /[^\S   ]+/, co = /(?<=[^-‐–—])([-‐–—]+)(?=[^-‐–—])/u, lo = /^([^\p{L}\p{M}]*)([\p{L}\p{M}]+)([^\p{L}\p{M}]*)$/u, uo = /* @__PURE__ */ new Set([
	"/",
	".",
	"?",
	"&",
	"=",
	"_",
	",",
	":",
	";",
	"#",
	"\\"
]), fo = 12, po = typeof Intl < "u" && "Segmenter" in Intl ? (() => {
	let e = new Intl.Segmenter(void 0, { granularity: "grapheme" });
	return (t) => Array.from(e.segment(t), (e) => e.segment);
})() : (e) => Array.from(e);
function mo(e, t) {
	let n = [], r = e.split(co);
	for (let e = 0; e < r.length; e += 2) {
		let i = r[e], a = r[e + 1];
		a !== void 0 && (i += a);
		let o = ho(i, t);
		a !== void 0 && (o[o.length - 1].joint = "explicit"), n.push(...o);
	}
	return n.filter((e) => e.text.length > 0);
}
function ho(e, t) {
	let n = lo.exec(e);
	if (n && t) {
		let [, e = "", r = "", i = ""] = n, a = t(r);
		if (a.length > 1 && a.join("") === r) return a[0] = e + a[0], a[a.length - 1] += i, a.map((e, t) => ({
			text: e,
			joint: t < a.length - 1 ? "hyphen" : null
		}));
	}
	if (!n && e.length > fo) {
		let t = [], n = 0;
		for (let r = 1; r < e.length; r++) {
			let i = e[r - 1];
			uo.has(i) && !uo.has(e[r]) && (t.push({
				text: e.slice(n, r),
				joint: "soft"
			}), n = r);
		}
		return t.push({
			text: e.slice(n),
			joint: null
		}), t;
	}
	return [{
		text: e,
		joint: null
	}];
}
function go(e, t, n, r) {
	let i = [], a = 0;
	for (let o of e) {
		let e = n(t.slice(0, a + o.text.length)) - n(t.slice(0, a));
		if (a += o.text.length, e <= r) {
			i.push(o);
			continue;
		}
		let s = po(o.text);
		s.forEach((e, t) => i.push({
			text: e,
			joint: t < s.length - 1 ? "char" : o.joint
		}));
	}
	return i;
}
function _o(e, t) {
	let { measure: n, align: r } = t, i = t.hyphenate ?? null, a = t.hyphenPenalty ?? 50, o = n(" "), s = n("-"), c = [], l = (e) => {
		switch (e) {
			case "hyphen": return $a(s, a, !0, "-");
			case "explicit": return $a(0, a, !0);
			case "soft": return $a(0, 100);
			case "char": return $a(0, 1e3);
		}
	}, u = () => {
		r === "justify" ? c.push(Qa(o, o / 2, o / 3)) : c.push(Qa(0, 3 * o, 0), $a(0, 0), Qa(o, -3 * o, 0));
	};
	for (let r of e.replace(/\r\n?/g, "\n").split("\n")) {
		let e = r.split(so).filter(Boolean);
		e.length === 0 ? c.push(Za(0, "")) : t.indent && c.push(Za(t.indent, "")), e.forEach((e, r) => {
			r > 0 && u();
			let a = mo(e, i);
			t.splitWiderThan !== void 0 && (a = go(a, e, n, t.splitWiderThan));
			let o = 0, s = 0;
			for (let t of a) {
				o += t.text.length;
				let r = n(e.slice(0, o));
				c.push(Za(r - s, t.text)), s = r, t.joint && c.push(l(t.joint));
			}
		}), c.push(Qa(0, Xa, 0), $a(0, -Ya));
	}
	return c;
}
//#endregion
//#region ../typeset/src/measure.ts
function vo(e) {
	let t = /* @__PURE__ */ new Map();
	return (n) => {
		let r = t.get(n);
		return r === void 0 && (r = e(n), t.set(n, r)), r;
	};
}
function yo(e) {
	let t = (typeof OffscreenCanvas < "u" ? new OffscreenCanvas(1, 1) : document.createElement("canvas")).getContext("2d");
	if (!t) throw Error("canvas 2d context unavailable");
	return t.font = e, t.fontKerning = "normal", vo((e) => t.measureText(e).width);
}
//#endregion
//#region ../typeset/src/hyphenate.ts
var bo = "­";
function xo(e, t = 5) {
	return (n) => e.hyphenateSync(n, { minWordLength: t }).split(bo);
}
//#endregion
//#region ../typeset/src/typeset.ts
var So = [
	"optimal",
	"loose",
	"emergency",
	"overfull"
], Co = (e, t) => So.indexOf(e) >= So.indexOf(t) ? e : t;
function wo(e, t) {
	let n = t.align ?? "justify", r = t.tolerances ?? (n === "justify" ? [
		1,
		1.5,
		3
	] : [1, 3]), i = {
		measure: t.measure,
		align: n,
		hyphenate: t.hyphenate ?? null
	}, a = e.replace(/\r\n?/g, "\n").split("\n").map((e, n) => {
		let r = t.indent && (n > 0 || t.indentFirst) && e.trim() ? t.indent : 0, a = {
			...i,
			indent: r
		};
		return {
			text: e,
			fmt: a,
			nodes: _o(e, a)
		};
	}), o = /* @__PURE__ */ new Map(), s = 0, c = 0;
	for (let { nodes: e } of a) {
		let t = 0;
		for (let n of e) n.type === "box" && (s = Math.max(s, n.width)), n.type !== "penalty" && (t += n.width);
		c = Math.max(c, t);
	}
	function l(e) {
		let n = typeof e == "number" ? [e] : e, r = n.join(","), i = o.get(r);
		if (i) return i;
		let s = [], c = "optimal", l = 0;
		a.forEach((e, r) => {
			let i = n.slice(Math.min(s.length, n.length - 1)), o = u(e.text, e.fmt, e.nodes, i);
			for (let e of o) e.y = l, l += t.lineHeight, s.push(e);
			r < a.length - 1 && (l += t.paragraphSpacing ?? 0), c = Co(c, o[0]?.quality ?? "optimal");
		});
		let d = {
			lines: s,
			height: l,
			quality: c
		};
		return o.set(r, d), d;
	}
	function u(e, n, i, a) {
		for (let e of r) {
			let n = ao(i, a, {
				...t.breakOptions,
				tolerance: e
			});
			if (n) return d(i, n, a, "optimal");
		}
		let o = Math.min(...a), s = {
			...t.breakOptions,
			tolerance: Infinity,
			emergencyStretch: o / 10
		}, c = ao(i, a, s);
		if (c) return d(i, c, a, "loose");
		let l = _o(e, {
			...n,
			splitWiderThan: o
		}), u = ao(l, a, s);
		return u ? d(l, u, a, "emergency") : d(l, oo(l, a), a, "overfull");
	}
	function d(e, t, r, i) {
		let a = -1;
		return t.map((t, o) => {
			let s = r[Math.min(o, r.length - 1)], c = To(e, no(e, a), t, s, n, i);
			return a = t.position, c;
		});
	}
	return {
		layout: l,
		heights: (e) => e.map((e) => l(e).height),
		minWidth: s,
		maxWidth: c
	};
}
function To(e, t, n, r, i, a) {
	let o = e[n.position], s = Number.isFinite(n.ratio) ? n.ratio : 0, c = [], l = 0, u = 0, d = !1;
	for (let r = t; r < n.position; r++) {
		let t = e[r];
		if (t.type === "box") {
			let e = c[c.length - 1];
			d && e && e.text !== "" ? (e.text += t.text, e.width += t.width) : c.push({
				text: t.text,
				x: l,
				width: t.width
			}), l += t.width, u += t.width, d = !0;
		} else t.type === "glue" && (l += t.width + s * (s < 0 ? t.shrink : t.stretch), u += t.width, d = !1);
	}
	let f = o.type === "penalty" && o.text !== "", p = c[c.length - 1];
	f && p && o.type === "penalty" && (p.text += o.text, p.width += o.width, u += o.width);
	let m = o.type === "penalty" && o.penalty <= -1e4, h = c.filter((e) => e.text !== ""), g = h.length - 1, _ = i === "justify" && !m && g > 0;
	return {
		text: h.map((e) => e.text).join(" "),
		items: h,
		width: r,
		natural: u,
		ratio: n.ratio,
		hyphenated: f,
		justify: _,
		wordSpacing: _ ? (r - u) / g : 0,
		indent: h[0]?.x ?? 0,
		y: 0,
		endsParagraph: m,
		quality: a
	};
}
//#endregion
//#region ../typeset/src/dom.ts
function Eo(e, t, n = document) {
	let { lineHeight: r, mode: i = "css" } = t, a = n.createElement("div");
	if (a.className = "pv-line", Object.assign(a.style, {
		position: "absolute",
		left: `${e.indent}px`,
		top: `${e.y}px`,
		width: `${e.width - e.indent}px`,
		height: `${r}px`,
		whiteSpace: "nowrap"
	}), i === "css") {
		let t = e.justify ? "justify" : "left";
		if (a.style.textAlign = t, a.style.textAlignLast = t, e.justify) {
			let t = Math.max(1, e.items.length - 1);
			a.style.wordSpacing = `${(e.wordSpacing - 1 / t).toFixed(3)}px`;
		}
		a.textContent = e.text;
	} else for (let t of e.items) {
		let r = n.createElement("span");
		r.style.position = "absolute", r.style.left = `${t.x - e.indent}px`, r.textContent = t.text, a.appendChild(r);
	}
	return a;
}
function Do(e, t, n = document) {
	let r = n.createElement("div");
	r.className = t.className ?? "pv-text";
	let i = Math.max(0, ...e.lines.map((e) => e.width));
	Object.assign(r.style, {
		position: "relative",
		width: `${i}px`,
		height: `${e.height}px`,
		lineHeight: `${t.lineHeight}px`,
		fontKerning: "normal"
	});
	for (let i of e.lines) r.appendChild(Eo(i, t, n));
	return r;
}
//#endregion
//#region ../../node_modules/.pnpm/hyphen@1.14.1/node_modules/hyphen/hyphen.js
var Oo = /* @__PURE__ */ o(((e, t, n) => {
	(function(e, n) {
		typeof define == "function" && define.amd ? define([], n) : typeof t == "object" && t.exports ? t.exports = n() : e.createHyphenator = n();
	})(n, function() {
		function e(e) {
			var t = "", n = "", r = 0, i = e();
			return function(e) {
				for (; r < e.length;) {
					t = e.charAt(r++), n = e.charAt(r);
					var a = i(t, n);
					if (a !== void 0) return a;
				}
			};
		}
		var t = RegExp.prototype.test.bind(/\s|(?![\'])[\!-\@\[-\`\{-\~\u2013-\u203C]/);
		function n() {
			var e = !1;
			return function(n, r) {
				return e ? r[0] === ">" && (n(), e = !1) : r[0] === "<" && (!t(r[1]) || r[1] === "/") && (e = !0), e;
			};
		}
		function r(e) {
			var n = !1;
			return function(r, i) {
				return n ? !t(i[0]) && t(i[1]) && (r(), n = !1) : !t(i[0]) && i[1] === e && (n = !0), n;
			};
		}
		function i(e, n) {
			return function() {
				var r = "", i = "";
				function a() {
					r += i, i = "";
				}
				function o(e) {
					return r = "", i = "", e;
				}
				return function(s, c) {
					i += s;
					var l = e.reduce(function(e, t) {
						return e || t(a, [s, c]);
					}, !1);
					if (!l && (t(s) && !t(c) && a(), !t(s) && t(c))) {
						if (i.length >= n) return o([r, i]);
						a();
					}
					if (c === "") return (i.length < n || l) && a(), o([r, i]);
				};
			};
		}
		function a(e) {
			for (var t = [], n = 0; n < e.length; n++) (e[n] & 1) == 1 && t.push(n);
			return t;
		}
		function o(e, t, n) {
			if (n.length === 0) return e;
			var r = [e.slice(0, n[0])];
			if (n.length > 1) for (var i = 0, a = 1; a < n.length; i++, a++) r.push(e.slice(n[i], n[a]));
			return r.push(e.slice(n[n.length - 1])), r.join(t);
		}
		function s(e) {
			return e.reduce(function(e, t) {
				for (var n = 0, r = []; (n = t.indexOf("-", n + 1)) > -1;) r.push(n);
				return e[t.toLocaleLowerCase().replace(/\-/g, "")] = r, e;
			}, {});
		}
		function c(e) {
			var t = 0;
			function n() {
				return e[t++];
			}
			return n;
		}
		function l(e) {
			var t = 0, n = e;
			function r() {
				if (n = e.slice(t++), !(n.length < 3)) return n;
			}
			function i() {
				return t === 2;
			}
			return [r, i];
		}
		function u(e, t, n, r) {
			for (var i = Array(e.length + 1), t = ("." + t + ".").split(""), o, s, u, d, f, p, m = -1, h, g, _, v, y = i.length; y--;) i[y] = 0;
			for (h = l(t), g = h[0], _ = h[1]; o = g();) for (m++, _() && m--, u = r, v = c(o); (s = v()) && (d = u[s]) !== void 0;) {
				switch (u = {}, f = -1, Object.prototype.toString.call(d)) {
					case "[object Array]":
						u = d[0], f = d[1];
						break;
					case "[object Object]":
						u = d;
						break;
					case "[object Number]": f = d;
				}
				if (!(f < 0)) {
					p = n[f];
					for (var b = 0; b < p.length; b++) i[m + b] = Math.max(p[b], i[m + b]);
				}
			}
			return i[0] = i[1] = i[i.length - 1] = i[i.length - 2] = 0, a(i);
		}
		function d(t, a, s, c, l, d, f, p, m) {
			function h() {
				y(g);
			}
			var g = "", _, v = e(i((f ? [n()] : []).concat(r(d)), p)), y = function() {};
			function b() {
				for (var e = /* @__PURE__ */ new Date(); (!m || /* @__PURE__ */ new Date() - e < 10) && (_ = v(t));) {
					if (_[1]) {
						var n = _[1].length ? "~" + _[1] : "";
						if (!Object.prototype.hasOwnProperty.call(c, n)) {
							var r = _[1].toLocaleLowerCase();
							Object.prototype.hasOwnProperty.call(l, r) || (l[r] = u(_[1], r, a, s)), c[n] = o(_[1], d, l[r]);
						}
						_[1] = c[n];
					}
					g += _[0] + _[1];
				}
				_ ? setTimeout(b) : h();
			}
			return m ? (setTimeout(b), new Promise(function(e) {
				y = e;
			})) : (b(), g);
		}
		var f = !1, p = [], m = !0, h = "­", g = 5, _ = "async", v = "exceptions", y = "html", b = "hyphenChar", x = "minWordLength", S = typeof global == "object" ? global : typeof window == "object" ? window : typeof self == "object" ? self : {};
		function C(e, t) {
			for (var n in e ||= {}, t) e[n] = t[n];
			return e;
		}
		function ee(e) {
			return e instanceof Array;
		}
		function w(e, t, n, r) {
			return t in e && (!r || r(e[t])) ? e[t] : n;
		}
		function te(e, t) {
			var n = {};
			for (var r in e) n["~" + r] = o(r, t, e[r]);
			return n;
		}
		function T(e, t) {
			return e.reduce(function(e, n) {
				return e["~" + n.replace(/\-/g, "")] = n.replace(/\-/g, t), e;
			}, {});
		}
		function E(e, t) {
			t ||= {};
			var n = w(t, _, f), r = {}, i = {}, a = {}, o = w(t, b, h), c = e[0], l = e[1], u = w(t, x, g) | 0, E = w(t, y, m), ne = w(t, v, p, ee), D = o + u;
			if (a[D] = {}, e[2] && (a[D] = te(e[2], o), i = e[2]), ne && ne.length && (a[D] = C(a[D], T(ne, o)), i = C(i, s(ne))), r[D] = C({}, a[D]), n && !("Promise" in S)) throw Error("Failed to create hyphenator: Could not find global Promise object, needed for hyphenator to work in async mode");
			return function(t, f) {
				f ||= {};
				var m = w(f, b, o), h = w(f, x, u) | 0, g = w(f, v, p, ee), _ = m + h;
				return !a[_] && e[2] && (a[_] = te(e[2], m), r[_] = C(r[_], a[_])), g && g.length && (a[_] = C(a[_], T(g, m)), i = C(i, s(g)), r[_] = C(r[_], a[_])), d(t, c, l, r[_], i, m, E, h, n);
			};
		}
		return E;
	});
})), ko = /* @__PURE__ */ o(((e, t) => {
	var n = Oo();
	t.exports = function(e) {
		return {
			hyphenate: n(e, { async: !0 }),
			hyphenateHTML: n(e, {
				async: !0,
				html: !0
			}),
			hyphenateHTMLSync: n(e, { html: !0 }),
			hyphenateSync: n(e),
			patterns: e
		};
	};
})), Ao = /* @__PURE__ */ o(((e, t, n) => {
	(function(e, n) {
		typeof define == "function" && define.amd ? define([], function() {
			return n;
		}) : typeof t == "object" && t.exports ? t.exports = n : e.hyphenationPatternsEnUs = n;
	})(n, [
		[
			[
				0,
				0,
				0,
				4
			],
			[
				0,
				0,
				4
			],
			[
				0,
				0,
				1
			],
			[
				0,
				0,
				3
			],
			[
				0,
				0,
				5
			],
			[
				0,
				0,
				0,
				5
			],
			[
				0,
				0,
				0,
				0,
				5
			],
			[
				0,
				0,
				0,
				0,
				0,
				5
			],
			[
				0,
				0,
				0,
				2
			],
			[
				0,
				0,
				2
			],
			[
				0,
				0,
				0,
				0,
				0,
				0,
				5
			],
			[
				0,
				0,
				0,
				3
			],
			[
				0,
				0,
				0,
				0,
				3
			],
			[
				0,
				0,
				5,
				0,
				5
			],
			[
				0,
				0,
				0,
				3,
				4
			],
			[
				0,
				0,
				0,
				1
			],
			[
				0,
				0,
				0,
				5,
				5
			],
			[
				0,
				0,
				0,
				0,
				4
			],
			[4],
			[0, 5],
			[
				0,
				0,
				5,
				5
			],
			[0, 4],
			[4, 2],
			[0, 3],
			[0, 2],
			[2],
			[
				4,
				0,
				4
			],
			[3],
			[
				0,
				4,
				4
			],
			[0, 1],
			[
				0,
				5,
				0,
				5
			],
			[5, 5],
			[5],
			[
				0,
				4,
				5
			],
			[
				0,
				4,
				1
			],
			[
				0,
				0,
				3,
				3
			],
			[
				0,
				0,
				0,
				0,
				0,
				4
			],
			[2, 2],
			[
				0,
				0,
				5,
				0,
				4
			],
			[
				5,
				5,
				0,
				4
			],
			[
				0,
				0,
				4,
				2
			],
			[1],
			[2, 1],
			[4, 1],
			[
				4,
				0,
				2
			],
			[
				4,
				0,
				5
			],
			[
				4,
				0,
				0,
				4
			],
			[4, 3],
			[2, 3],
			[
				0,
				0,
				0,
				0,
				5,
				4
			],
			[
				3,
				0,
				3
			],
			[
				3,
				0,
				0,
				5
			],
			[
				0,
				2,
				2
			],
			[
				5,
				0,
				0,
				4
			],
			[
				0,
				0,
				0,
				0,
				0,
				3
			],
			[
				2,
				5,
				2
			],
			[4, 5],
			[2, 5],
			[
				2,
				0,
				0,
				4
			],
			[
				0,
				0,
				0,
				5,
				0,
				5
			],
			[
				0,
				5,
				4
			],
			[
				4,
				0,
				3
			],
			[
				4,
				0,
				1
			],
			[
				3,
				0,
				0,
				2
			],
			[
				0,
				0,
				2,
				5
			],
			[
				1,
				4,
				4
			],
			[
				4,
				3,
				2
			],
			[
				0,
				0,
				0,
				5,
				4
			],
			[3, 4],
			[1, 2],
			[
				2,
				3,
				4
			],
			[
				0,
				0,
				2,
				2
			],
			[
				0,
				1,
				4
			],
			[
				0,
				3,
				0,
				4
			],
			[
				0,
				1,
				2
			],
			[
				1,
				4,
				3
			],
			[
				5,
				0,
				3
			],
			[
				0,
				4,
				0,
				3
			],
			[
				1,
				0,
				1
			],
			[
				0,
				5,
				2
			],
			[
				4,
				1,
				4
			],
			[
				2,
				1,
				2
			],
			[
				0,
				1,
				1
			],
			[
				0,
				4,
				3
			],
			[
				0,
				0,
				0,
				0,
				2
			],
			[
				0,
				0,
				4,
				1
			],
			[
				0,
				0,
				2,
				4
			],
			[
				0,
				5,
				0,
				0,
				5
			],
			[
				0,
				3,
				0,
				0,
				3
			],
			[
				0,
				0,
				1,
				0,
				2
			],
			[
				0,
				4,
				0,
				4
			],
			[
				0,
				4,
				3,
				0,
				3
			],
			[
				0,
				1,
				0,
				0,
				4
			],
			[
				0,
				0,
				3,
				4
			],
			[
				0,
				2,
				5
			],
			[
				0,
				0,
				4,
				4
			],
			[
				0,
				0,
				4,
				0,
				4
			],
			[
				0,
				0,
				0,
				2,
				5
			],
			[
				0,
				1,
				0,
				3
			],
			[
				0,
				4,
				2
			],
			[
				0,
				2,
				0,
				5
			],
			[
				4,
				1,
				2
			],
			[
				1,
				0,
				4
			],
			[5, 4],
			[
				3,
				4,
				4
			],
			[
				4,
				3,
				3
			],
			[
				5,
				0,
				0,
				5
			],
			[
				2,
				5,
				3
			],
			[
				0,
				5,
				5
			],
			[
				0,
				4,
				0,
				2
			],
			[
				3,
				0,
				0,
				4
			],
			[
				0,
				0,
				4,
				3
			],
			[
				2,
				0,
				4
			],
			[
				5,
				0,
				5
			],
			[
				4,
				5,
				4
			],
			[
				0,
				0,
				0,
				0,
				0,
				0,
				4
			],
			[
				0,
				0,
				3,
				0,
				3
			],
			[
				0,
				4,
				0,
				0,
				4
			],
			[
				5,
				5,
				2
			],
			[
				2,
				0,
				1
			],
			[
				4,
				0,
				0,
				5
			],
			[
				0,
				2,
				5,
				5
			],
			[5, 2],
			[
				4,
				4,
				4
			],
			[1, 4],
			[4, 4],
			[
				0,
				2,
				0,
				0,
				4
			],
			[
				0,
				3,
				3
			],
			[
				0,
				5,
				0,
				0,
				4
			],
			[
				0,
				0,
				0,
				4,
				5
			],
			[
				0,
				0,
				0,
				1,
				3
			],
			[
				0,
				0,
				2,
				1
			],
			[
				0,
				4,
				0,
				5
			],
			[
				0,
				0,
				0,
				4,
				4
			],
			[
				0,
				0,
				5,
				4
			],
			[
				5,
				0,
				0,
				5,
				5
			],
			[
				0,
				0,
				0,
				3,
				0,
				3
			],
			[
				0,
				0,
				0,
				0,
				1
			],
			[
				3,
				0,
				4
			],
			[
				0,
				2,
				0,
				4
			],
			[1, 1],
			[
				3,
				0,
				1
			],
			[
				2,
				3,
				2
			],
			[
				1,
				2,
				2
			],
			[
				0,
				0,
				3,
				0,
				5
			],
			[
				5,
				0,
				4
			],
			[
				0,
				0,
				0,
				0,
				4,
				3
			],
			[
				0,
				1,
				0,
				4
			],
			[
				0,
				0,
				0,
				5,
				2
			],
			[
				0,
				0,
				0,
				0,
				4,
				5
			],
			[
				5,
				0,
				0,
				0,
				4
			],
			[
				0,
				0,
				2,
				3
			],
			[
				0,
				0,
				0,
				3,
				3
			],
			[
				0,
				0,
				0,
				3,
				2
			],
			[
				0,
				0,
				2,
				0,
				2
			],
			[
				5,
				0,
				0,
				3
			],
			[
				2,
				0,
				2
			],
			[
				0,
				4,
				0,
				1
			],
			[
				0,
				0,
				0,
				0,
				5,
				0,
				5
			],
			[
				2,
				1,
				4
			],
			[
				1,
				0,
				2
			],
			[
				0,
				3,
				2
			],
			[
				0,
				0,
				0,
				1,
				6,
				1
			],
			[
				0,
				0,
				4,
				1,
				0,
				1
			],
			[
				0,
				0,
				5,
				0,
				1
			],
			[
				0,
				0,
				3,
				0,
				1
			],
			[
				0,
				0,
				3,
				6
			],
			[
				0,
				0,
				5,
				2
			],
			[
				0,
				0,
				0,
				2,
				3
			],
			[
				0,
				0,
				6,
				1,
				0,
				1
			],
			[
				0,
				0,
				6
			],
			[
				0,
				0,
				4,
				0,
				1
			],
			[
				0,
				0,
				0,
				5,
				2,
				1
			],
			[
				0,
				0,
				1,
				4
			],
			[
				0,
				0,
				6,
				3
			],
			[
				0,
				0,
				0,
				1,
				2
			],
			[
				0,
				0,
				0,
				5,
				0,
				1
			],
			[
				0,
				0,
				0,
				0,
				0,
				6
			],
			[
				0,
				0,
				0,
				6,
				0,
				4
			],
			[
				0,
				0,
				0,
				6,
				0,
				1
			],
			[
				0,
				0,
				5,
				0,
				0,
				1
			],
			[
				0,
				0,
				5,
				0,
				0,
				5
			],
			[
				0,
				0,
				1,
				0,
				3,
				0,
				5
			],
			[
				0,
				0,
				0,
				0,
				6
			],
			[
				0,
				0,
				3,
				0,
				1,
				2
			],
			[
				0,
				0,
				3,
				0,
				0,
				5
			],
			[
				0,
				0,
				0,
				3,
				0,
				1,
				1
			],
			[
				0,
				0,
				6,
				1
			],
			[
				0,
				1,
				3
			],
			[
				0,
				0,
				0,
				0,
				2,
				1
			],
			[
				0,
				0,
				0,
				0,
				2,
				2
			],
			[
				0,
				0,
				0,
				1,
				0,
				5
			],
			[
				0,
				0,
				2,
				1,
				1
			],
			[
				0,
				0,
				0,
				6,
				2
			],
			[
				0,
				0,
				0,
				5,
				1
			],
			[
				0,
				0,
				0,
				1,
				1,
				2
			],
			[
				0,
				0,
				6,
				0,
				1,
				3
			],
			[
				0,
				0,
				0,
				0,
				1,
				1
			],
			[
				0,
				2,
				0,
				0,
				3,
				0,
				6
			],
			[
				1,
				0,
				2,
				1
			],
			[
				0,
				0,
				5,
				0,
				0,
				0,
				1
			],
			[
				0,
				0,
				3,
				0,
				0,
				3
			],
			[
				2,
				1,
				0,
				2
			],
			[
				3,
				0,
				5
			],
			[
				0,
				0,
				0,
				0,
				1,
				5
			],
			[
				0,
				1,
				0,
				3,
				0,
				0,
				0,
				5
			],
			[
				0,
				0,
				0,
				0,
				3,
				5
			],
			[
				0,
				0,
				1,
				0,
				1,
				1
			],
			[
				0,
				0,
				0,
				2,
				1
			],
			[
				1,
				6,
				3,
				3,
				0,
				0,
				0,
				1
			],
			[
				0,
				2,
				3,
				4
			],
			[
				0,
				3,
				0,
				0,
				0,
				6
			],
			[
				5,
				0,
				2,
				0,
				0,
				0,
				1
			],
			[
				0,
				0,
				0,
				0,
				0,
				1
			],
			[
				0,
				0,
				0,
				1,
				6
			],
			[
				0,
				0,
				3,
				1
			],
			[
				0,
				2,
				1
			],
			[
				2,
				1,
				4,
				3,
				1
			],
			[
				0,
				0,
				2,
				3,
				0,
				5
			],
			[
				0,
				3,
				5,
				0,
				0,
				1,
				4
			],
			[
				0,
				0,
				0,
				0,
				0,
				1,
				2
			],
			[
				0,
				0,
				0,
				0,
				6,
				3
			],
			[
				0,
				0,
				1,
				0,
				1
			],
			[
				1,
				0,
				6
			],
			[
				1,
				0,
				5
			],
			[
				0,
				0,
				4,
				3,
				5
			],
			[
				0,
				0,
				0,
				6,
				3
			],
			[
				0,
				3,
				0,
				0,
				0,
				6,
				1
			],
			[
				0,
				0,
				0,
				4,
				1
			],
			[
				1,
				0,
				0,
				3,
				0,
				6
			],
			[
				0,
				0,
				3,
				6,
				0,
				2
			],
			[
				0,
				2,
				3
			],
			[
				0,
				5,
				0,
				3
			],
			[
				0,
				0,
				1,
				0,
				0,
				1,
				1
			],
			[
				1,
				0,
				0,
				0,
				3
			],
			[
				1,
				0,
				0,
				5
			],
			[
				3,
				0,
				0,
				1,
				1
			],
			[
				0,
				0,
				0,
				3,
				1
			],
			[
				0,
				0,
				0,
				1,
				0,
				0,
				1
			],
			[
				0,
				0,
				0,
				0,
				0,
				6,
				1
			],
			[
				0,
				0,
				3,
				0,
				0,
				0,
				3
			],
			[
				3,
				0,
				3,
				0,
				5
			],
			[
				0,
				0,
				1,
				2,
				0,
				1
			],
			[
				0,
				3,
				0,
				1
			],
			[
				5,
				0,
				0,
				0,
				1,
				0,
				1
			],
			[
				5,
				0,
				0,
				1,
				0,
				1
			],
			[
				0,
				0,
				0,
				1,
				5
			],
			[
				0,
				0,
				0,
				4,
				0,
				1
			],
			[
				0,
				0,
				0,
				0,
				6,
				5
			],
			[
				0,
				0,
				0,
				0,
				1,
				6
			],
			[
				0,
				0,
				0,
				0,
				4,
				0,
				2
			],
			[
				0,
				5,
				0,
				0,
				0,
				0,
				2
			],
			[
				0,
				0,
				0,
				2,
				0,
				5
			],
			[
				0,
				3,
				0,
				2,
				0,
				1
			],
			[
				5,
				0,
				0,
				3,
				0,
				1
			],
			[
				0,
				0,
				0,
				1,
				4
			],
			[
				5,
				0,
				0,
				1
			],
			[
				0,
				0,
				0,
				0,
				0,
				2
			],
			[
				0,
				0,
				0,
				3,
				0,
				0,
				1,
				1
			],
			[
				0,
				1,
				0,
				3,
				4
			],
			[
				0,
				3,
				0,
				0,
				0,
				0,
				6
			],
			[
				0,
				3,
				0,
				2,
				1,
				3
			],
			[
				0,
				0,
				4,
				0,
				0,
				3,
				0,
				4
			],
			[
				0,
				5,
				0,
				0,
				0,
				1
			],
			[
				0,
				5,
				0,
				0,
				3
			],
			[
				0,
				0,
				0,
				3,
				1,
				1
			],
			[
				0,
				6,
				3,
				4
			],
			[
				0,
				0,
				0,
				6,
				1
			],
			[
				0,
				0,
				0,
				6
			],
			[
				0,
				0,
				0,
				0,
				0,
				6,
				0,
				4
			],
			[
				0,
				0,
				0,
				5,
				0,
				0,
				1,
				3
			],
			[
				0,
				0,
				2,
				1,
				3
			],
			[
				0,
				0,
				3,
				0,
				0,
				0,
				1
			],
			[
				1,
				0,
				0,
				0,
				0,
				3
			],
			[
				0,
				0,
				0,
				0,
				3,
				3
			],
			[
				3,
				0,
				0,
				0,
				2
			],
			[
				0,
				0,
				0,
				0,
				3,
				6,
				3,
				2
			],
			[
				0,
				0,
				0,
				3,
				0,
				0,
				4
			],
			[
				0,
				5,
				0,
				0,
				0,
				3
			],
			[
				0,
				0,
				0,
				0,
				0,
				2,
				1
			],
			[
				0,
				0,
				6,
				3,
				0,
				3
			],
			[
				0,
				0,
				0,
				0,
				0,
				0,
				6
			],
			[
				0,
				0,
				0,
				0,
				5,
				0,
				0,
				5
			],
			[
				3,
				0,
				4,
				5,
				1
			],
			[
				0,
				3,
				0,
				0,
				1
			],
			[
				0,
				0,
				2,
				3,
				1
			],
			[
				0,
				0,
				0,
				5,
				6
			],
			[
				0,
				0,
				0,
				1,
				1
			],
			[6],
			[
				0,
				0,
				1,
				0,
				0,
				1
			],
			[
				0,
				0,
				5,
				0,
				0,
				0,
				0,
				1
			],
			[
				0,
				3,
				0,
				0,
				5
			],
			[
				5,
				0,
				3,
				0,
				0,
				5
			],
			[
				0,
				0,
				0,
				0,
				0,
				1,
				0,
				0,
				0,
				1
			],
			[
				1,
				0,
				0,
				2
			],
			[
				0,
				0,
				3,
				0,
				0,
				1
			],
			[
				0,
				0,
				1,
				0,
				6,
				5
			],
			[
				3,
				0,
				0,
				0,
				0,
				1
			],
			[
				3,
				2,
				0,
				1,
				1
			],
			[3, 2],
			[
				0,
				0,
				0,
				0,
				0,
				0,
				3
			],
			[
				0,
				2,
				1,
				3,
				0,
				0,
				1
			],
			[
				0,
				5,
				0,
				0,
				0,
				5,
				3
			],
			[
				0,
				2,
				1,
				0,
				0,
				5
			],
			[
				1,
				0,
				0,
				0,
				1
			],
			[
				0,
				0,
				0,
				0,
				0,
				1,
				1
			],
			[
				0,
				0,
				0,
				1,
				0,
				4,
				1
			],
			[
				0,
				0,
				2,
				0,
				0,
				1,
				6
			],
			[
				1,
				0,
				0,
				0,
				3,
				2
			],
			[
				5,
				0,
				0,
				1,
				1
			],
			[
				0,
				6,
				0,
				6
			],
			[
				5,
				0,
				0,
				2
			],
			[
				3,
				0,
				0,
				1
			],
			[
				0,
				3,
				0,
				0,
				2
			],
			[
				0,
				0,
				1,
				5,
				0,
				0,
				1
			],
			[
				0,
				1,
				0,
				2
			],
			[
				0,
				0,
				0,
				0,
				3,
				0,
				0,
				1
			],
			[
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				3,
				3
			],
			[
				0,
				0,
				0,
				0,
				0,
				0,
				1
			],
			[
				3,
				0,
				0,
				1,
				0,
				1
			],
			[
				3,
				0,
				0,
				0,
				1,
				5
			],
			[
				0,
				1,
				0,
				1,
				0,
				0,
				3
			],
			[
				0,
				0,
				0,
				0,
				0,
				1,
				0,
				1
			],
			[
				0,
				1,
				0,
				0,
				5,
				0,
				1
			],
			[
				0,
				1,
				0,
				1
			],
			[
				0,
				0,
				1,
				0,
				0,
				3,
				3
			],
			[
				0,
				0,
				0,
				0,
				0,
				3,
				6,
				2
			],
			[
				0,
				0,
				0,
				0,
				1,
				4
			],
			[
				0,
				0,
				0,
				5,
				0,
				0,
				1
			],
			[
				0,
				3,
				1
			]
		],
		{
			".": {
				a: {
					c: { h: 0 },
					d: { d: { e: { r: 1 } } },
					f: { t: 2 },
					l: { t: 3 },
					m: { a: { t: 4 } },
					n: {
						c: 4,
						g: 0,
						i: { m: 5 },
						t: [{
							e: 3,
							i: { s: 6 }
						}, 0]
					},
					r: {
						s: 4,
						t: {
							i: { e: 1 },
							y: 1
						}
					},
					s: {
						c: 3,
						p: 2,
						s: 2,
						t: { e: { r: 7 } }
					},
					t: { o: { m: 6 } },
					u: { d: 2 },
					v: { i: 1 },
					w: { n: 0 }
				},
				b: {
					a: {
						g: 1,
						n: { a: 4 },
						s: { e: 0 }
					},
					e: {
						r: [{ a: 4 }, 0],
						s: {
							m: 3,
							t: { o: 4 }
						}
					},
					r: { i: 8 },
					u: { t: { t: { i: 0 } } }
				},
				c: {
					a: {
						m: { p: { e: 0 } },
						n: { c: 5 },
						p: { a: { b: 6 } },
						r: { o: { l: 5 } },
						t: 1
					},
					e: { l: { a: 1 } },
					h: [{ i: { l: { l: { i: 7 } } } }, 1],
					i: [{ t: { r: 5 } }, 9],
					o: {
						e: 3,
						r: [{ n: { e: { r: 5 } } }, 1],
						n: { g: { r: 5 } }
					}
				},
				d: {
					e: {
						m: { o: { i: 1 } },
						o: 3,
						r: {
							a: 3,
							i: [{ v: { a: 4 } }, 3]
						},
						s: { c: 0 }
					},
					i: { c: { t: { i: { o: 10 } } } },
					o: { t: 1 },
					u: {
						c: 1,
						m: { b: 6 }
					},
					r: { i: { v: 67 } }
				},
				e: {
					a: {
						r: { t: { h: 7 } },
						s: { i: 11 }
					},
					b: 1,
					e: { r: 0 },
					g: 9,
					l: {
						d: 4,
						e: { m: 3 }
					},
					n: {
						a: { m: 12 },
						g: 3,
						s: 3
					},
					q: { u: { i: { t: 13 } } },
					r: { r: { i: 1 } },
					s: 3,
					u: [{ l: { e: { r: 1 } } }, 3],
					y: { e: 5 },
					t: { h: { y: { l: 162 } } },
					v: [{ e: { r: { s: { i: { b: 158 } } } } }, 9]
				},
				f: {
					e: { s: 11 },
					o: { r: { m: { e: { r: 5 } } } }
				},
				g: {
					a: [{ s: { o: { m: 163 } } }, 9],
					e: [{
						n: { t: 14 },
						o: {
							g: 4,
							m: { e: 1 },
							t: 164
						}
					}, 9],
					i: {
						a: 4,
						b: 1
					},
					o: { r: 1 }
				},
				h: {
					a: { n: {
						d: { i: 6 },
						k: 5
					} },
					e: [{
						r: { o: {
							i: 6,
							e: 3
						} },
						s: 11,
						t: 11,
						m: { o: 165 },
						p: { a: 166 }
					}, 9],
					i: {
						b: 3,
						e: { r: 3 }
					},
					o: {
						n: {
							e: { y: 5 },
							o: 11
						},
						v: 5
					}
				},
				i: {
					d: {
						l: 1,
						o: { l: 12 }
					},
					m: {
						m: 3,
						p: { i: { n: 4 } }
					},
					n: [{
						c: { i: 3 },
						e: 8,
						k: 9,
						s: 3,
						u: { t: 167 }
					}, 2],
					r: { r: 4 },
					s: { i: 1 }
				},
				j: { u: { r: 3 } },
				l: {
					a: {
						c: { y: 1 },
						m: 1,
						t: {
							e: { r: 5 },
							h: 6
						}
					},
					e: [{
						g: { e: 5 },
						n: 0,
						p: 5,
						v: 15,
						i: { c: { e: { s: 170 } } }
					}, 9],
					i: {
						g: [{ a: 5 }, 1],
						n: 9,
						o: 3,
						t: 1
					}
				},
				m: {
					a: {
						g: { a: 16 },
						l: { o: 5 },
						n: { a: 5 },
						r: { t: { i: 5 } }
					},
					e: [{
						r: { c: 11 },
						t: {
							e: { r: 4 },
							a: { l: { a: 0 } }
						},
						g: { a: { l: 171 } }
					}, 9],
					i: {
						s: [{
							t: { i: 6 },
							e: { r: { s: 173 } }
						}, 15],
						m: { i: { c: 172 } }
					},
					o: {
						n: { e: 11 },
						r: { o: 3 }
					},
					u: { t: { a: [{ b: 6 }, 4] } }
				},
				n: {
					i: { c: 1 },
					e: { o: { f: 174 } },
					o: {
						e: { t: { h: 15 } },
						n: { e: { m: 175 } }
					}
				},
				o: {
					d: [{ d: 5 }, 9],
					f: { t: { e: 4 } },
					r: {
						a: { t: { o: 4 } },
						c: 3,
						d: 2,
						t: 3
					},
					s: [{ t: { l: 1 } }, 3],
					t: { h: 11 },
					u: { t: 11 }
				},
				p: {
					e: {
						d: { a: { l: 5 } },
						t: {
							e: 4,
							i: { t: 4 }
						}
					},
					i: {
						e: 1,
						o: { n: 5 },
						t: 9
					},
					r: { e: {
						m: 11,
						a: { m: 15 }
					} },
					o: {
						l: { y: { s: 137 } },
						s: { t: { a: { m: 137 } } }
					}
				},
				r: {
					a: {
						c: 1,
						n: { t: 0 },
						t: { i: { o: { n: { a: 7 } } } },
						v: { e: { n: { o: 176 } } }
					},
					e: {
						e: [{ c: 173 }, 8],
						m: { i: { t: 4 } },
						s: [{ t: { a: { t: 4 } } }, 8]
					},
					i: {
						g: 1,
						t: { u: 5 }
					},
					o: {
						q: 1,
						s: { t: 5 },
						w: { d: 5 }
					},
					u: { d: 1 }
				},
				s: {
					c: { i: { e: 11 } },
					e: {
						l: {
							f: 6,
							l: 6
						},
						n: 9,
						r: { i: { e: 4 } },
						m: { i: [{
							c: 0,
							d: 177,
							p: 36,
							r: 36,
							s: 178,
							v: 36
						}, 6] }
					},
					h: 9,
					i: [{ n: { g: 17 } }, 9],
					t: [{ a: { b: { l: 5 } } }, 1],
					y: 9,
					p: {
						h: { i: { n: 179 } },
						i: { n: { o: 137 } }
					}
				},
				t: {
					a: [{ p: { e: { s: { t: { r: 180 } } } } }, 1],
					e: [{
						n: { a: { n: 5 } },
						l: { e: { g: { r: 3 } } }
					}, 1],
					h: 9,
					i: [{
						l: 0,
						m: { o: 16 },
						n: {
							g: 17,
							k: 5
						}
					}, 9],
					o: {
						n: { a: 0 },
						p: [{
							i: 5,
							o: { g: 170 }
						}, 1],
						u: { s: 5 },
						q: 9
					},
					r: { i: { b: { u: { t: 6 } } } }
				},
				u: {
					n: {
						a: [{ t: { t: 144 } }, 2],
						c: { e: 3 },
						d: { e: { r: 7 } },
						e: [{ r: { r: 181 } }, 2],
						k: 4,
						o: 4,
						u: 3
					},
					p: 3,
					r: { e: 11 },
					s: { a: 4 }
				},
				v: {
					e: {
						n: { d: { e: 0 } },
						r: { a: 4 }
					},
					i: { c: { a: { r: 151 } } }
				},
				w: {
					i: { l: { i: 5 } },
					e: { b: { l: 131 } }
				},
				y: { e: 1 },
				k: {
					i: { l: { n: { i: 168 } } },
					o: { r: { t: { e: 169 } } }
				}
			},
			a: {
				b: {
					".": 18,
					a: {
						l: 19,
						n: 19
					},
					e: [{ r: { d: 4 } }, 8],
					i: {
						a: 5,
						t: { a: { b: 13 } }
					},
					l: { a: { t: 4 } },
					o: { l: { i: {
						z: 20,
						c: 19
					} } },
					r: [{ o: { g: 4 } }, 18],
					u: { l: 3 }
				},
				c: {
					a: {
						r: [{
							d: 4,
							o: 4
						}, 21],
						b: { l: 24 }
					},
					e: {
						o: { u: 19 },
						r: 2
					},
					h: { e: { t: 19 } },
					i: [{
						e: 23,
						n: 2,
						o: 23
					}, 22],
					r: { o: { b: 4 } },
					t: { i: { f: 5 } },
					u: {
						l: 3,
						m: 1
					}
				},
				d: [{
					d: { i: { n: 1 } },
					e: { r: { ".": 4 } },
					i: [{
						a: 23,
						c: { a: 3 },
						e: { r: 0 },
						o: 23,
						t: 23,
						u: 19
					}, 25],
					l: { e: 1 },
					o: { w: 3 },
					r: { a: { n: 4 } },
					s: { u: 1 },
					u: [{
						c: 23,
						m: 4
					}, 18]
				}, 24],
				e: { r: [{ i: { e: 17 } }, 1] },
				f: [{ f: [{ i: { s: { h: 170 } } }, 0] }, 24],
				g: {
					a: {
						b: 21,
						n: 0
					},
					e: {
						l: { l: 4 },
						o: 0,
						u: 18
					},
					i: 2,
					l: 26,
					n: 2,
					o: [{
						g: 27,
						n: { i: 3 }
					}, 24],
					u: {
						e: { r: 19 },
						l: 4
					},
					y: 21
				},
				h: {
					a: 23,
					e: 23,
					l: 1,
					o: 23
				},
				i: [{
					a: 19,
					c: { ".": 23 },
					l: { y: 4 },
					n: [{
						i: { n: 5 },
						o: 5
					}, 28],
					t: { e: { n: 5 } }
				}, 9],
				j: 29,
				k: { e: { n: 2 } },
				l: {
					a: {
						b: 4,
						d: 3,
						r: 21
					},
					d: { i: 18 },
					e: [{
						n: {
							d: 3,
							t: { i: 21 }
						},
						o: 30
					}, 25],
					i: [{
						a: { ".": 1 },
						e: 0
					}, 2],
					l: {
						e: { v: 4 },
						i: { c: 18 }
					},
					m: 18,
					o: { g: { ".": 19 } },
					y: {
						".": 21,
						s: [{ t: 31 }, 18],
						t: 32,
						z: 27
					}
				},
				m: {
					a: [{
						b: 4,
						g: 3,
						r: { a: 5 },
						s: { c: 4 },
						t: {
							i: { s: 21 },
							o: 33
						}
					}, 18],
					e: {
						r: { a: 4 },
						n: { t: { a: { b: 182 } } }
					},
					i: {
						c: 3,
						f: 4,
						l: { y: 4 },
						n: [{ o: 0 }, 2]
					},
					o: [{
						n: 19,
						r: { i: 6 }
					}, 24],
					p: { e: { n: 5 } }
				},
				n: [{
					a: {
						g: { e: 3 },
						l: { y: [{ s: 183 }, 27] },
						r: [{
							c: 3,
							i: 17
						}, 23],
						t: { i: 23 }
					},
					d: [{
						e: { s: 17 },
						i: { s: 3 },
						l: 2,
						o: { w: 1 }
					}, 18],
					e: {
						e: 19,
						n: 23,
						s: { t: { ".": 4 } },
						u: 23
					},
					g: [{
						i: { e: 5 },
						l: 2
					}, 25],
					i: {
						c: 34,
						e: { s: 23 },
						f: 35,
						m: {
							e: 1,
							i: 19
						},
						n: { e: 19 },
						o: 3,
						p: 23,
						s: { h: 3 },
						t: 3,
						u: 23
					},
					k: { l: { i: 1 } },
					n: { i: { z: 32 } },
					o: [{
						t: [{ h: 7 }, 4],
						a: { c: 148 }
					}, 0],
					s: {
						a: 9,
						c: { o: 1 },
						n: 1,
						p: [{ o: 11 }, 9],
						t: 1,
						u: { r: 1 },
						g: { r: 5 },
						v: 11
					},
					t: {
						a: { l: 36 },
						i: {
							e: 1,
							d: 137,
							n: 184,
							r: { e: 137 }
						},
						o: 18,
						r: 9,
						w: 1
					},
					u: {
						a: 3,
						l: 3,
						r: 19
					}
				}, 24],
				o: 18,
				p: {
					a: {
						r: 17,
						t: 4
					},
					e: {
						r: { o: 4 },
						a: { b: { l: { e: 132 } } }
					},
					h: {
						e: { r: 23 },
						i: 18
					},
					i: {
						l: { l: { a: [{ r: 4 }, 21] } },
						n: 3,
						t: {
							a: 3,
							u: 23
						}
					},
					l: 24,
					o: {
						c: 6,
						l: { a: 4 },
						r: { i: 6 },
						s: { t: 12 }
					},
					s: { e: { s: 5 } },
					u: 23
				},
				q: { u: { e: 6 } },
				r: [{
					a: {
						c: { t: 3 },
						d: {
							e: 19,
							i: { s: 4 }
						},
						l: 3,
						m: { e: { t: { e: 19 } } },
						n: { g: 17 },
						p: 11,
						t: [{ i: {
							o: 19,
							v: 4
						} }, 1],
						u: 19,
						v: 38,
						w: 17
					},
					b: { a: { l: 36 } },
					c: { h: {
						a: { n: 1 },
						e: { t: 185 }
					} },
					d: {
						i: { n: { e: 4 } },
						r: 1
					},
					e: {
						a: { s: 4 },
						e: 23,
						n: { t: 3 },
						s: { s: 19 }
					},
					f: {
						i: 1,
						l: 1
					},
					i: [{
						a: {
							l: 4,
							n: 3
						},
						e: { t: 23 },
						m: 1,
						n: { a: { t: 4 } },
						o: 3,
						z: 9
					}, 2],
					m: { i: 9 },
					o: {
						d: 20,
						n: { i: 19 },
						o: 23
					},
					p: 9,
					q: 3,
					r: {
						e: 17,
						a: { n: { g: { e: 9 } } }
					},
					s: {
						a: 1,
						h: 9
					}
				}, 37],
				s: {
					".": 18,
					a: {
						b: 1,
						n: { t: 3 }
					},
					h: { i: 17 },
					i: {
						a: { ".": 19 },
						b: 23,
						c: 23,
						t: 39
					},
					k: { i: 11 },
					l: 1,
					o: { c: 21 },
					p: { h: 4 },
					s: { h: 1 },
					t: {
						e: { n: 3 },
						r: 2
					},
					u: { r: { a: 6 } },
					y: { m: { p: { t: { o: { t: 4 } } } } }
				},
				t: {
					a: [{
						b: { l: 3 },
						c: 4,
						l: { o: 3 },
						p: 4
					}, 24],
					e: {
						c: [{ h: 4 }, 5],
						g: { o: 3 },
						n: { ".": 3 },
						r: {
							a: 3,
							n: [{ a: 19 }, 6]
						},
						s: { t: 3 },
						v: 4
					},
					h: [{
						e: {
							m: 5,
							n: 19,
							r: { o: { s: 186 } }
						},
						o: [{ m: 5 }, 1]
					}, 18],
					i: {
						".": 18,
						a: 19,
						b: 20,
						c: 2,
						f: 3,
						o: { n: { a: { r: 7 } } },
						t: { u: 3 }
					},
					o: {
						g: 21,
						m: [{ i: { z: 4 } }, 24],
						p: 21,
						s: 21
					},
					r: [{ o: { p: 4 } }, 29],
					s: { k: 1 },
					t: {
						a: { g: 1 },
						e: [{ s: { ".": 170 } }, 4],
						h: 1
					},
					u: [{
						a: 4,
						e: 4,
						l: 3,
						r: { a: 3 }
					}, 24],
					y: 24
				},
				u: {
					b: 1,
					g: {
						h: [{ t: { l: 17 } }, 12],
						u: 3
					},
					l: [{ i: { f: 13 } }, 40],
					n: { d: 5 },
					r: 3,
					s: { i: { b: 4 } },
					t: {
						e: { n: 5 },
						h: 2
					}
				},
				v: {
					a: [{
						g: 3,
						n: 19
					}, 24],
					e: {
						n: { o: 0 },
						r: {
							a: 3,
							n: 4,
							y: 4
						}
					},
					i: [{
						e: { r: 0 },
						g: 3,
						o: { u: 3 }
					}, 2],
					o: {
						c: 4,
						r: 29
					}
				},
				w: {
					a: { y: 27 },
					i: 3,
					l: { y: 1 },
					s: 0
				},
				x: { i: {
					c: 1,
					d: 1
				} },
				y: {
					a: { l: 4 },
					e: 0,
					s: 0
				},
				z: {
					i: { e: { r: 0 } },
					z: { i: 5 }
				}
			},
			b: {
				a: {
					".": 32,
					d: { g: { e: { r: 5 } } },
					g: { e: 1 },
					l: { a: 15 },
					n: {
						d: { a: { g: 5 } },
						e: 0,
						i: 11
					},
					r: {
						b: { i: 7 },
						i: { a: 17 },
						o: { n: { i: { e: 187 } } }
					},
					s: { s: { i: 0 } },
					t: [{ h: { y: 2 } }, 41],
					z: 1,
					c: { k: { e: { r: { ".": 84 } } } }
				},
				b: [{
					e: [{ r: 23 }, 24],
					i: {
						n: { a: 0 },
						t: 0
					}
				}, 42],
				d: 43,
				e: {
					".": 18,
					a: {
						k: 17,
						t: 12
					},
					d: [{
						a: 3,
						e: 3,
						i: 3
					}, 44],
					g: {
						i: 3,
						u: 4
					},
					l: [{
						i: 2,
						o: 3
					}, 41],
					m: 45,
					n: {
						i: { g: 4 },
						u: 4
					},
					s: [{
						p: 3,
						t: { r: 4 }
					}, 46],
					t: [{
						i: { z: 5 },
						r: 4,
						w: 3
					}, 27],
					w: 3,
					y: { o: 4 },
					v: { i: { e: 9 } }
				},
				f: 25,
				h: 47,
				i: {
					b: 9,
					d: [{ i: { f: 167 } }, 1],
					e: [{
						n: 4,
						r: 1
					}, 27],
					f: 48,
					l: [{
						i: { z: 3 },
						l: { a: { b: 8 } }
					}, 41],
					n: {
						a: { r: 49 },
						d: 0,
						e: { t: 4 }
					},
					o: {
						g: { r: 3 },
						u: 4,
						m: 5,
						r: {
							b: 2,
							h: 15
						}
					},
					t: [{
						i: {
							o: 50,
							v: { e: 188 }
						},
						r: 3,
						u: { a: 51 },
						z: 19
					}, 9]
				},
				j: 29,
				k: 1,
				l: [{
					a: {
						t: { h: 7 },
						n: { d: 189 }
					},
					e: {
						".": 21,
						n: 17,
						s: { p: 32 }
					},
					i: {
						s: 23,
						n: { d: 189 }
					},
					o: [{ n: { d: 190 } }, 21],
					u: { n: { t: 17 } }
				}, 52],
				m: 43,
				n: [{ e: { g: 5 } }, 47],
				o: {
					d: [{ i: 11 }, 27],
					e: 1,
					l: { i: { c: 11 } },
					m: { b: { i: 0 } },
					n: { a: [{ t: 5 }, 0] },
					o: 27,
					r: {
						".": 32,
						a: 43,
						d: 5,
						e: 32,
						i: 32,
						n: { o: 191 }
					},
					s: 53,
					t: {
						a: 19,
						h: 6,
						o: 1,
						u: { l: 192 }
					},
					u: { n: { d: 54 } }
				},
				p: 18,
				r: {
					i: { t: 18 },
					o: { t: { h: 54 } },
					u: { s: { q: 17 } }
				},
				s: [{ o: { r: 17 } }, 55],
				t: [{
					l: 1,
					o: 21,
					r: 23
				}, 25],
				u: {
					f: { f: { e: { r: 0 } } },
					g: { a: 1 },
					l: { i: 3 },
					m: { i: 17 },
					n: [{ t: { i: 17 } }, 1],
					r: { e: 3 },
					s: {
						i: { e: [{
							r: 193,
							s: 193
						}, 5] },
						s: {
							e: 17,
							i: { n: { g: 17 } }
						},
						t: 32
					},
					t: {
						a: 18,
						i: { o: 27 },
						o: 19,
						e: { d: { ".": 8 } },
						t: { e: { d: 0 } }
					}
				},
				v: 29,
				w: 56,
				y: {
					".": 32,
					s: 0
				}
			},
			c: {
				a: [{
					b: {
						i: { n: 11 },
						l: 2
					},
					c: { h: 17 },
					d: { e: {
						n: 4,
						m: 194
					} },
					g: 46,
					h: 57,
					l: {
						a: { t: 3 },
						l: {
							a: 0,
							i: { n: 6 }
						},
						o: 18
					},
					n: {
						d: 5,
						e: 0,
						i: {
							c: 0,
							s: 5,
							z: 11
						},
						t: { y: 0 },
						y: 17
					},
					p: { e: { r: 4 } },
					r: { o: { m: 5 } },
					s: {
						t: {
							e: { r: 6 },
							i: { g: 5 }
						},
						y: 18
					},
					t: {
						h: 1,
						i: { v: 18 },
						a: { s: 195 }
					},
					v: { a: { l: 5 } }
				}, 41],
				c: [{
					h: { a: 6 },
					i: { a: 0 },
					o: {
						m: { p: { a: 10 } },
						n: 17,
						u: { t: 12 }
					}
				}, 23],
				e: {
					".": 25,
					d: {
						".": 18,
						e: { n: 18 }
					},
					i: 27,
					l: {
						".": 32,
						l: 27
					},
					n: [{
						c: 27,
						e: 58,
						i: 18,
						t: 27
					}, 41],
					p: 27,
					r: { a: { m: 4 } },
					s: {
						a: 18,
						s: { i: [{ b: 59 }, 27] },
						t: 5
					},
					t: [{ a: 60 }, 0],
					w: 0
				},
				h: [{
					".": 18,
					a: {
						b: 61,
						n: { i: {
							c: 32,
							s: 20
						} }
					},
					e: [{
						a: { p: 54 },
						d: 18,
						l: { o: 5 },
						m: { i: 27 },
						n: { e: 4 },
						r: {
							".": 3,
							s: 3
						}
					}, 8],
					i: {
						n: [{
							e: {
								".": 32,
								s: { s: 4 }
							},
							i: 32
						}, 62],
						o: 32,
						t: 27,
						z: 8,
						e: { v: { o: 6 } }
					},
					o: 63,
					t: { i: 1 },
					s: {
						".": 18,
						h: { u: 11 }
					}
				}, 25],
				i: [{
					a: [{
						b: 64,
						r: 5
					}, 27],
					c: 4,
					e: { r: 18 },
					f: { i: { c: { ".": 32 } } },
					i: 18,
					l: {
						a: 1,
						i: 27
					},
					m: 25,
					n: [{
						a: [{ t: 27 }, 21],
						e: { m: 11 },
						g: [{ ".": 19 }, 29],
						o: 32,
						q: 8
					}, 25],
					o: { n: 17 },
					p: {
						e: 18,
						h: 3,
						i: { c: 18 }
					},
					s: { t: {
						a: 18,
						i: 18
					} },
					t: [{ i: { z: 11 } }, 42],
					z: 32,
					g: { a: { r: 152 } }
				}, 41],
				k: [{ i: 3 }, 2],
				l: [{
					a: { r: [{
						a: { t: { i: { o: 19 } } },
						e: 32
					}, 18] },
					e: {
						m: 0,
						a: { r: 0 }
					},
					i: {
						c: 18,
						m: 17
					},
					y: 0
				}, 65],
				n: 19,
				o: [{
					a: { g: 4 },
					e: 8,
					g: [{ r: 1 }, 25],
					i: [{ n: { c: 3 } }, 0],
					l: {
						i: 5,
						o: [{ r: 11 }, 32]
					},
					m: { e: { r: 5 } },
					n: {
						a: 0,
						e: 21,
						g: 11,
						t: 5
					},
					p: {
						a: 3,
						i: { c: 11 },
						l: 1,
						h: { o: { n: 196 } }
					},
					r: {
						b: 18,
						o: { n: 12 }
					},
					s: { e: 0 },
					v: [{ e: 17 }, 15],
					w: { a: 5 },
					z: {
						e: 5,
						i: 4
					},
					u: { s: { t: { i: 84 } } }
				}, 41],
				q: 29,
				r: {
					a: {
						s: { t: 6 },
						t: {
							".": 32,
							i: { c: 32 }
						}
					},
					e: {
						a: { t: 11 },
						d: 32,
						t: { a: 47 },
						v: 0
					},
					i: [{
						f: 5,
						n: 21,
						s: 17,
						t: { i: [{ e: 11 }, 32] }
					}, 8],
					o: {
						p: {
							l: 0,
							o: 6
						},
						s: { e: 17 },
						c: { o: { d: 197 } },
						e: { c: { o: 148 } }
					},
					u: { d: 0 }
				},
				s: 66,
				t: [{
					a: {
						b: 0,
						n: {
							g: 4,
							t: 19
						}
					},
					e: [{ r: 23 }, 24],
					i: {
						c: { u: 21 },
						m: { i: 12 }
					},
					u: { r: 0 },
					w: 21,
					r: { o: { m: { e: { c: 198 } } } }
				}, 42],
				u: {
					d: 5,
					f: 21,
					i: [{ t: { y: 4 } }, 21],
					l: {
						i: 32,
						t: {
							i: { s: 0 },
							u: 27
						}
					},
					m: {
						a: 9,
						e: 23,
						i: 1
					},
					n: 27,
					p: {
						i: 3,
						y: 4
					},
					r: {
						a: {
							b: 67,
							n: { c: { e: 199 } }
						},
						i: { a: 4 }
					},
					s: [{ s: { i: 17 } }, 41],
					t: [{
						i: {
							e: 1,
							v: 56
						},
						r: 18
					}, 68]
				},
				y: 41,
				z: { e: 0 }
			},
			d: {
				a: [{
					".": 32,
					b: 70,
					c: { h: 17 },
					f: 18,
					g: 25,
					m: 71,
					n: { g: 11 },
					r: {
						d: 6,
						k: 6,
						y: 18
					},
					t: [{
						i: { v: 18 },
						o: 18,
						a: { b: 137 }
					}, 27],
					v: [{ e: 5 }, 53],
					y: 32,
					l: { o: { n: { e: 48 } } }
				}, 69],
				b: 29,
				c: 19,
				d: [{
					a: { b: 20 },
					i: { b: 94 }
				}, 72],
				e: {
					".": 25,
					a: {
						f: 6,
						l: { s: { ".": 1 } }
					},
					b: {
						i: { t: 5 },
						o: { n: 1 }
					},
					c: {
						a: { n: 36 },
						i: { l: 1 },
						o: { m: 4 },
						l: {
							a: { r: 200 },
							i: { n: { a: 64 } }
						}
					},
					d: 42,
					e: { ".": 18 },
					i: { f: 4 },
					l: {
						i: {
							e: 17,
							q: 16
						},
						o: 4
					},
					m: [{
						".": 32,
						i: {
							c: [{ ".": 5 }, 27],
							l: 4
						},
						o: {
							n: { s: 1 },
							r: 7,
							s: 9
						}
					}, 21],
					n: [{
						a: { r: 1 },
						o: 3,
						t: { i: { f: 7 } },
						u: 3
					}, 41],
					p: [{
						a: 3,
						i: 17,
						u: 9
					}, 2],
					q: 23,
					r: {
						h: 21,
						m: 32,
						n: { i: { z: 6 } },
						s: 5
					},
					s: [{
						".": 24,
						c: 2,
						o: 64,
						t: {
							i: 11,
							r: 3
						},
						u: 1,
						i: { c: 11 }
					}, 8],
					t: [{
						o: 9,
						i: { c: 9 }
					}, 2],
					v: [{ i: { l: 11 } }, 2],
					y: 18,
					f: { i: { n: { i: { t: { i: 201 } } } } }
				},
				f: 43,
				g: {
					a: 21,
					e: { t: 73 },
					i: 2,
					y: 24
				},
				h: 74,
				i: {
					".": 32,
					a: [{ b: 5 }, 75],
					c: {
						a: {
							m: 1,
							i: { d: 15 }
						},
						e: 21,
						t: 27
					},
					d: 27,
					e: { n: 76 },
					f: [{ f: { r: { a: 5 } } }, 29],
					g: { e: 3 },
					l: { a: { t: { o: 1 } } },
					n: [{
						a: 41,
						e: { ".": 27 },
						i: [{ z: 4 }, 32]
					}, 29],
					o: [{ g: 5 }, 41],
					p: { l: 1 },
					r: [{
						e: [{
							n: 9,
							r: 9
						}, 2],
						t: { i: 6 }
					}, 8],
					s: [{
						i: 32,
						t: 77
					}, 15],
					t: { i: 24 },
					v: 78,
					m: { e: { t: { h: { y: 141 } } } }
				},
				j: 29,
				k: 79,
				l: {
					a: 56,
					e: {
						".": 27,
						d: 27,
						s: {
							".": 27,
							s: 18
						},
						a: { d: 42 }
					},
					o: 48,
					u: 56,
					y: 25,
					i: { e: 202 }
				},
				m: 29,
				n: 80,
				o: [{
					".": 27,
					d: { e: 4 },
					e: 32,
					f: 57,
					g: 21,
					l: {
						a: 1,
						i: 17,
						o: { r: 4 }
					},
					m: { i: { z: 5 } },
					n: {
						a: { t: 3 },
						i: 17
					},
					o: { d: 11 },
					p: { p: 0 },
					r: 21,
					s: 27,
					u: { t: 56 },
					v: 1,
					x: 27,
					w: { o: { r: { d: 203 } } }
				}, 41],
				p: 29,
				r: [{
					a: {
						g: { o: { n: 6 } },
						i: 18
					},
					e: [{
						a: { r: 6 },
						n: [{ a: { l: 204 } }, 32]
					}, 0],
					i: {
						b: 0,
						l: 17,
						f: { t: { a: 189 } },
						p: { l: { e: { g: 205 } } }
					},
					o: {
						p: 0,
						w: 18,
						m: { e: { d: 206 } }
					},
					u: { p: { l: { i: 32 } } },
					y: 18
				}, 41],
				s: [{
					p: 1,
					w: 21,
					y: 21
				}, 81],
				t: {
					h: 24,
					a: { b: 23 }
				},
				u: [{
					a: [{ l: { ".": 9 } }, 82],
					c: [{
						a: 29,
						e: { r: 5 },
						t: {
							".": 18,
							s: 18
						}
					}, 9],
					e: { l: 4 },
					g: 1,
					l: { e: 23 },
					m: { b: { e: 0 } },
					n: 1,
					p: [{ e: 1 }, 18],
					o: { p: { o: { l: 207 } } }
				}, 41],
				v: 29,
				w: 29,
				y: [{
					n: 32,
					s: {
						e: 1,
						p: 5
					}
				}, 24]
			},
			e: {
				a: {
					b: 72,
					c: { t: 23 },
					d: [{ i: { e: 5 } }, 15],
					g: { e: [{ r: 4 }, 1] },
					l: [{
						e: { r: 5 },
						o: { u: 11 }
					}, 1],
					m: { e: { r: 11 } },
					n: {
						d: 19,
						i: { e: { s: 111 } }
					},
					r: {
						a: 11,
						c: 0,
						e: { s: 5 },
						i: {
							c: 0,
							l: 0
						},
						k: 5,
						t: [{ e: 12 }, 8]
					},
					s: {
						p: 4,
						s: 23,
						t: 12
					},
					t: [{
						e: { n: 5 },
						h: { i: 12 },
						i: { f: 19 },
						u: 83
					}, 9],
					v: [{
						e: { n: 11 },
						i: 5,
						o: 5
					}, 9]
				},
				b: [{
					e: {
						l: {
							".": 21,
							s: 21
						},
						n: 21
					},
					i: { t: 21 },
					r: 23
				}, 42],
				c: {
					a: {
						d: 21,
						n: { c: 6 }
					},
					c: { a: 6 },
					e: [{ s: { s: { a: 4 } } }, 29],
					i: [{
						b: 21,
						f: {
							i: {
								c: { a: { t: 4 } },
								e: 4
							},
							y: 4
						},
						m: 3,
						t: [{ e: 19 }, 0]
					}, 9],
					l: {
						a: { m: 21 },
						u: { s: 21 }
					},
					o: {
						l: 24,
						m: {
							m: 21,
							p: { e: 21 }
						},
						n: { c: 21 },
						r: [{
							a: 3,
							o: 5
						}, 24]
					},
					r: [{ e: { m: 21 } }, 29],
					t: {
						a: { n: 1 },
						e: 1
					},
					u: [{ l: [{ a: 3 }, 21] }, 29],
					h: { a: { s: 23 } }
				},
				d: {
					a: 37,
					d: 61,
					e: {
						r: 34,
						s: 0
					},
					i: [{
						a: 23,
						b: 3,
						c: { a: 3 },
						m: 3,
						t: 2,
						z: 5
					}, 18],
					o: [{
						l: 21,
						n: 84
					}, 18],
					r: { i: 21 },
					u: { l: [{
						o: 4,
						i: { n: { g: 2 } }
					}, 21] },
					g: { l: 15 }
				},
				e: {
					c: 9,
					d: { i: 11 },
					f: 9,
					l: {
						i: 11,
						y: 1
					},
					m: 9,
					n: { a: 1 },
					p: 85,
					s: [{ t: 17 }, 86],
					t: { y: 1 },
					x: 19
				},
				f: [{
					e: { r: { e: 83 } },
					f: 41,
					i: {
						c: [{ i: 32 }, 21],
						l: 17,
						n: {
							e: 23,
							i: { t: { e: 20 } }
						},
						t: 27
					},
					o: { r: { e: { s: 6 } } },
					u: { s: { e: { ".": 21 } } }
				}, 29],
				g: {
					a: { l: 18 },
					e: { r: 17 },
					i: {
						b: 4,
						c: 1,
						n: { g: 4 },
						t: 87
					},
					n: 4,
					o: {
						".": 21,
						s: 21
					},
					u: {
						l: 2,
						r: 19
					},
					y: 32
				},
				h: [{ e: { r: 17 } }, 72],
				i: [{
					c: 19,
					d: 4,
					g: [{ l: 4 }, 8],
					m: { b: 23 },
					n: {
						f: 23,
						g: 29,
						s: { t: 19 }
					},
					r: { d: 0 },
					t: {
						e: 11,
						h: 3,
						y: 19
					}
				}, 9],
				j: [{ u: { d: [{ i: 4 }, 21] } }, 29],
				k: {
					i: { n: 0 },
					l: { a: 1 }
				},
				l: {
					a: [{
						".": 21,
						c: 21,
						n: { d: 17 },
						t: { i: { v: 4 } },
						w: 21,
						x: { a: 36 }
					}, 29],
					e: {
						a: 23,
						b: { r: { a: 4 } },
						c: 32,
						d: 21,
						g: { a: 3 },
						n: 19,
						r: 34,
						s: 29
					},
					f: 9,
					i: [{
						b: { e: 23 },
						c: {
							".": 33,
							a: 3
						},
						e: { r: 23 },
						g: { i: { b: 4 } },
						m: 19,
						n: { g: 83 },
						o: 23,
						s: [{ h: 4 }, 24],
						v: 88,
						t: { i: { s: 208 } }
					}, 9],
					l: {
						a: [{ b: 1 }, 18],
						o: 17
					},
					o: {
						c: 19,
						g: 4,
						p: { ".": 3 },
						a: 29
					},
					s: { h: 9 },
					t: { a: 1 },
					u: {
						d: 19,
						g: 4
					}
				},
				m: {
					a: {
						c: 21,
						g: 21,
						n: [{ a: 4 }, 19]
					},
					b: 4,
					e: [{
						l: 24,
						t: 21
					}, 29],
					i: {
						c: { a: 3 },
						e: 0,
						g: { r: { a: 4 } },
						n: [{
							e: 4,
							i: 35
						}, 89],
						s: [{
							h: 4,
							s: 19
						}, 21],
						z: 3
					},
					n: { i: { z: 32 } },
					o: {
						g: 0,
						n: { i: { o: 7 } }
					},
					p: { i: 3 },
					u: {
						l: [{ a: 4 }, 21],
						n: 11
					},
					y: 23
				},
				n: {
					a: {
						m: { o: 4 },
						n: { t: 21 }
					},
					c: { h: { e: { r: 17 } } },
					d: { i: {
						c: 3,
						x: 2
					} },
					e: {
						a: 19,
						e: 19,
						m: 3,
						r: { o: 4 },
						s: {
							i: 4,
							t: 4
						},
						t: { r: 3 },
						w: 23
					},
					i: {
						c: { s: 4 },
						e: 19,
						l: 19,
						o: 23,
						s: { h: 3 },
						t: 3,
						u: 19,
						z: 32
					},
					n: 18,
					o: [{
						g: 0,
						s: 21,
						v: 3
					}, 18],
					s: { w: 1 },
					t: {
						a: { g: { e: 5 } },
						h: { e: { s: 18 } }
					},
					u: {
						a: 3,
						f: 4
					},
					y: { ".": 23 },
					z: 61
				},
				o: {
					f: 19,
					g: [{ r: { a: { p: 3 } } }, 9],
					i: 90,
					l: 23,
					p: { a: { r: 11 } },
					r: [{
						e: 3,
						o: { l: 4 }
					}, 29],
					s: 0,
					t: [{ o: 1 }, 21],
					u: { t: 19 },
					w: 19
				},
				p: {
					a: [{
						i: 23,
						n: { c: 4 }
					}, 24],
					e: {
						l: 19,
						n: { t: 23 },
						t: { i: { t: { i: { o: 4 } } } }
					},
					h: { e: 17 },
					l: { i: 21 },
					o: 29,
					r: {
						e: {
							c: [{ a: 4 }, 21],
							d: 21,
							h: 3
						},
						o: [{ b: 21 }, 23]
					},
					s: { h: 1 },
					t: { i: { b: 13 } },
					u: { t: [{ a: 4 }, 21] },
					i: { n: { e: { p: { h: 209 } } } }
				},
				q: [{ u: { i: {
					l: 12,
					s: 91
				} } }, 29],
				r: {
					a: [{
						b: 0,
						n: { d: 18 },
						r: 3,
						t: { i: { ".": 18 } }
					}, 2],
					b: [{ l: 1 }, 25],
					c: { h: [{ e: 1 }, 3] },
					e: {
						".": 25,
						a: { l: 23 },
						c: { o: 5 },
						i: { n: 11 },
						l: { ".": 4 },
						m: { o: 3 },
						n: {
							a: 4,
							c: { e: 4 },
							e: 18,
							t: 3
						},
						q: 0,
						s: {
							s: 4,
							t: 3
						},
						t: 17
					},
					h: 2,
					i: [{
						a: [{ n: { ".": 210 } }, 92],
						c: { k: 32 },
						e: {
							n: 23,
							r: 0
						},
						n: { e: 3 },
						o: 29,
						t: 18,
						u: 1,
						v: [{ a: 21 }, 0]
					}, 2],
					m: 93,
					n: {
						i: {
							s: 1,
							t: 18,
							z: 32
						},
						o: 3
					},
					o: [{
						b: 4,
						c: 19,
						r: 0,
						u: 2
					}, 25],
					s: [{ e: { t: 3 } }, 2],
					t: {
						e: { r: 11 },
						l: 18,
						w: 3
					},
					u: [{ t: 0 }, 18],
					w: { a: { u: 32 } }
				},
				s: {
					a: [{ g: { e: {
						".": 21,
						s: 21
					} } }, 72],
					c: [{
						a: [{ n: 4 }, 24],
						r: 23,
						u: 4
					}, 9],
					e: [{
						c: [{ r: 4 }, 24],
						n: { c: 4 },
						r: {
							t: {
								".": 21,
								s: 21
							},
							v: { a: 21 }
						}
					}, 74],
					h: [{
						a: 23,
						e: { n: 5 }
					}, 18],
					i: [{
						c: 24,
						d: [{ e: { n: 4 } }, 24],
						g: { n: { a: 4 } },
						m: 94,
						n: 95,
						s: { t: { e: 17 } },
						u: 0
					}, 29],
					k: { i: { n: 19 } },
					m: { i: 1 },
					o: {
						l: [{ u: 3 }, 24],
						n: [{ a: 4 }, 24]
					},
					p: [{
						e: { r: 3 },
						i: { r: { a: 4 } },
						r: { e: 1 },
						a: { c: { i: 211 } }
					}, 29],
					s: [{ i: { b: 96 } }, 25],
					t: {
						a: { n: 36 },
						i: {
							g: 3,
							m: 4
						},
						o: [{ n: 23 }, 44],
						r: [{
							o: 19,
							u: { c: 10 }
						}, 25]
					},
					u: { r: [{ r: 4 }, 24] },
					w: 1
				},
				t: {
					a: { b: 0 },
					e: {
						n: { d: 17 },
						o: 23
					},
					h: {
						o: { d: 54 },
						y: { l: { e: { n: { e: 162 } } } }
					},
					i: {
						c: 2,
						d: { e: 19 },
						n: [{ o: 0 }, 17],
						r: 19,
						t: { i: {
							o: 19,
							v: 4
						} }
					},
					n: 18,
					o: { n: { a: 4 } },
					r: {
						a: 23,
						e: 23,
						i: {
							c: 3,
							f: 4
						},
						o: {
							g: 3,
							s: 4
						}
					},
					u: { a: 3 },
					y: { m: 4 },
					z: 4
				},
				u: [{
					n: 19,
					p: 23,
					r: { o: 3 },
					s: 0,
					t: {
						e: 17,
						i: { l: 6 },
						r: 4
					},
					c: { l: { i: { d: 212 } } }
				}, 18],
				v: {
					a: {
						p: 97,
						s: [{ t: 4 }, 24]
					},
					e: {
						a: 19,
						l: {
							l: 3,
							o: 12
						},
						n: {
							g: 19,
							i: 17
						},
						r: [{ b: 19 }, 2]
					},
					i: [{
						d: 3,
						l: 0,
						n: 21,
						v: 0
					}, 29],
					o: { c: 19 },
					u: 19
				},
				w: {
					a: [{ g: 21 }, 29],
					e: { e: 19 },
					h: 23,
					i: {
						l: 6,
						n: { g: 3 },
						t: 23
					}
				},
				x: { p: 41 },
				y: {
					c: 32,
					e: { ".": 32 },
					s: 0
				}
			},
			f: {
				a: [{
					b: {
						l: 3,
						r: 11
					},
					c: { e: 1 },
					g: 18,
					i: { n: 17 },
					l: { l: { e: 6 } },
					m: {
						a: 26,
						i: { s: 5 }
					},
					r: [{ t: { h: 5 } }, 32],
					t: {
						a: 3,
						h: { e: 3 },
						o: 18
					},
					u: { l: { t: 7 } }
				}, 41],
				b: 56,
				d: 18,
				e: {
					".": 18,
					a: {
						s: 17,
						t: { h: 54 }
					},
					b: [{ r: { u: { a: 15 } } }, 1],
					c: {
						a: 18,
						t: 32
					},
					d: 25,
					l: { i: 3 },
					m: { o: 1 },
					n: { d: [{ e: 6 }, 8] },
					r: [{
						r: 32,
						m: { i: { o: 213 } }
					}, 15],
					v: 0
				},
				f: [{
					e: { s: 21 },
					i: {
						e: 21,
						n: { ".": 19 },
						s: 94
					},
					l: { y: 21 },
					y: 24
				}, 43],
				h: 18,
				i: [{
					a: 3,
					c: {
						".": 48,
						a: {
							l: 47,
							n: 23,
							t: { e: 18 }
						},
						e: {
							n: 23,
							r: 3
						},
						i: [{
							a: 32,
							e: 32
						}, 0],
						s: 18,
						u: 3,
						h: 27
					},
					d: { e: { l: 4 } },
					g: { h: { t: 7 } },
					l: {
						i: 5,
						l: { i: { n: 6 } },
						y: 18
					},
					n: [{
						a: 32,
						d: 97,
						e: 9,
						g: 98,
						n: 0
					}, 25],
					s: { t: { i: 0 } },
					t: { t: { e: { d: { ".": 5 } } } }
				}, 41],
				l: [{
					e: { s: { s: 19 } },
					i: { n: 17 },
					o: {
						r: { e: 11 },
						w: { e: { r: { ".": 84 } } }
					},
					y: 100,
					a: { g: { e: { l: 214 } } },
					u: { o: { r: 27 } }
				}, 99],
				m: 18,
				n: 18,
				o: [{
					n: [{
						d: { e: 0 },
						t: 0
					}, 32],
					r: [{
						a: {
							t: 4,
							y: 5
						},
						e: { t: 6 },
						i: 0,
						t: { a: 6 }
					}, 9],
					s: 5
				}, 41],
				p: 56,
				r: {
					a: { t: 0 },
					e: {
						a: 19,
						s: { c: 6 }
					},
					i: [{ l: 17 }, 8],
					o: { l: 6 }
				},
				s: 48,
				t: [{
					o: 21,
					y: 24
				}, 25],
				u: [{
					e: { l: 4 },
					g: 18,
					m: { i: { n: 1 } },
					n: { e: 4 },
					r: { i: 3 },
					s: {
						i: 17,
						s: 0
					},
					t: { a: 18 }
				}, 27],
				y: 41
			},
			g: {
				a: [{
					f: 0,
					l: {
						".": 32,
						i: 27,
						o: 3
					},
					m: [{
						e: { t: 4 },
						o: 19
					}, 25],
					n: {
						i: {
							s: 5,
							z: [{ a: 6 }, 3]
						},
						o: 18
					},
					r: { n: 67 },
					s: { s: 17 },
					t: {
						h: 12,
						i: { v: 18 }
					},
					z: 18
				}, 41],
				b: 23,
				d: 1,
				e: {
					".": 25,
					d: 25,
					e: { z: 17 },
					l: {
						i: {
							n: 0,
							s: 4,
							z: 4
						},
						y: 18
					},
					n: [{
						a: { t: 1 },
						i: { z: 4 },
						o: 18,
						y: 18,
						c: { y: { ".": 8 } }
					}, 41],
					o: [{
						m: 3,
						d: 215
					}, 41],
					r: { y: 21 },
					s: { i: 32 },
					t: {
						h: 6,
						o: 18,
						y: 1,
						i: { c: { ".": 8 } }
					},
					v: 1
				},
				g: [{
					e: [{ r: 23 }, 24],
					l: { u: 6 },
					o: 0
				}, 101],
				h: {
					i: { n: 3 },
					o: { u: { t: 4 } },
					t: {
						o: 1,
						w: { e: 15 }
					}
				},
				i: {
					".": 32,
					a: [{ r: 5 }, 102],
					c: [{
						i: { a: 32 },
						o: 21
					}, 29],
					e: {
						n: 6,
						s: { ".": 32 }
					},
					l: 0,
					m: { e: { n: 23 } },
					n: {
						".": 68,
						g: { e: 5 },
						s: 103
					},
					o: 32,
					r: [{ l: 0 }, 27],
					s: { l: 23 },
					u: 1,
					v: 32,
					z: 27
				},
				l: [{
					a: [{
						d: { i: 6 },
						s: 32
					}, 0],
					e: [{ a: { d: 29 } }, 41],
					i: {
						b: 0,
						g: 23,
						s: { h: 43 }
					},
					o: [{
						r: 11,
						b: { i: { n: 106 } }
					}, 27]
				}, 9],
				m: [{ y: 21 }, 29],
				n: {
					a: [{
						".": 21,
						c: 69
					}, 1],
					e: { t: {
						t: 17,
						i: { s: { m: 137 } }
					} },
					i: [{
						n: 24,
						o: 21
					}, 29],
					o: [{
						n: 21,
						m: { o: 5 },
						r: {
							".": 216,
							e: { s: { p: 24 } }
						}
					}, 29]
				},
				o: [{
					".": 27,
					b: 5,
					e: 32,
					g: 104,
					i: { s: 3 },
					n: [{
						a: 105,
						d: { o: 7 },
						i: [{ z: { a: 217 } }, 3]
					}, 8],
					o: 32,
					r: {
						i: { z: 4 },
						o: { u: 5 }
					},
					s: { ".": 32 },
					v: 15
				}, 41],
				p: 23,
				r: [{
					a: {
						d: { a: 18 },
						i: 21,
						n: 84,
						p: { h: {
							".": 32,
							e: { r: [{ ".": 7 }, 19] },
							i: { c: 32 },
							y: 18
						} },
						y: 18
					},
					e: {
						n: 0,
						s: { s: { ".": 18 } }
					},
					i: {
						t: 18,
						e: { v: 213 }
					},
					o: 21,
					u: { f: 17 }
				}, 41],
				s: [{ t: { e: 19 } }, 9],
				t: { h: 11 },
				u: {
					a: [{ r: { d: 27 } }, 1],
					e: 25,
					i: { t: 106 },
					n: 27,
					s: 27,
					t: [{ a: { n: 29 } }, 26]
				},
				w: 23,
				y: [{
					n: 107,
					r: { a: 4 }
				}, 41]
			},
			h: {
				a: {
					b: { l: 73 },
					c: { h: 17 },
					e: {
						m: 0,
						t: 0
					},
					g: { u: 19 },
					l: { a: [{ m: 12 }, 3] },
					m: 1,
					n: {
						c: {
							i: 0,
							y: 0
						},
						d: { ".": 32 },
						g: [{
							e: { r: 6 },
							o: 6
						}, 0],
						i: { z: 108 },
						k: 0,
						t: { e: 0 }
					},
					p: {
						l: 11,
						t: 5,
						a: { r: { r: 218 } }
					},
					r: {
						a: {
							n: 3,
							s: 4
						},
						d: [{ e: 12 }, 8],
						l: { e: 0 },
						p: { e: { n: 6 } },
						t: { e: { r: 5 } }
					},
					s: { s: 5 },
					u: { n: 17 },
					z: [{ a: 11 }, 32],
					i: { r: { s: 137 } },
					t: { c: { h: 213 } }
				},
				b: 29,
				e: {
					a: {
						d: 41,
						r: 27
					},
					c: { a: {
						n: 1,
						t: 19
					} },
					d: [{ o: 13 }, 21],
					l: {
						i: 93,
						l: {
							i: { s: 0 },
							y: 0
						},
						o: 19
					},
					m: { p: 0 },
					n: [{ a: [{ t: 5 }, 17] }, 9],
					o: { r: 5 },
					p: 5,
					r: {
						a: [{ p: 12 }, 21],
						b: { a: 0 },
						e: { a: 6 },
						n: 23,
						o: { u: 19 },
						y: 23
					},
					s: [{ p: 64 }, 29],
					t: [{ e: { d: 0 } }, 1],
					u: 0,
					x: { a: 168 }
				},
				f: 29,
				h: 29,
				i: {
					a: { n: 4 },
					c: { o: 1 },
					g: { h: 6 },
					l: 109,
					m: { e: { r: 36 } },
					n: { a: 21 },
					o: { n: { e: 17 } },
					p: [{ e: { l: { a: 219 } } }, 1],
					r: {
						l: 0,
						o: 3,
						p: 0,
						r: 0
					},
					s: {
						e: { l: 11 },
						s: 0
					},
					t: {
						h: { e: { r: 6 } },
						e: { s: { i: { d: 12 } } }
					},
					v: 9
				},
				k: 18,
				l: [{
					a: { n: 17 },
					o: [{ r: { i: 11 } }, 24]
				}, 80],
				m: [{ e: { t: 17 } }, 43],
				n: [{ a: { u: { z: 12 } } }, 42],
				o: {
					d: {
						i: { z: 19 },
						s: 19
					},
					g: [{ e: 17 }, 1],
					l: {
						a: { r: 5 },
						e: 110
					},
					m: {
						a: 1,
						e: 12
					},
					n: {
						a: 0,
						y: 4
					},
					o: {
						d: 27,
						n: 17
					},
					r: {
						a: { t: 5 },
						i: {
							s: 4,
							c: { ".": 187 }
						},
						t: { e: 12 },
						u: 4
					},
					s: {
						e: [{ n: 4 }, 0],
						p: 15
					},
					u: { s: [{ e: 54 }, 41] },
					v: { e: { l: 5 } }
				},
				p: 56,
				r: [{
					e: { e: 6 },
					o: {
						n: { i: { z: 5 } },
						p: { o: 11 }
					}
				}, 26],
				s: [{ h: 21 }, 101],
				t: {
					a: { r: 21 },
					e: {
						n: 2,
						s: 4,
						o: { u: 216 }
					},
					y: 21
				},
				u: {
					g: 1,
					m: { i: { n: 1 } },
					n: {
						k: { e: 5 },
						t: 0
					},
					s: { t: 14 },
					t: 1
				},
				w: [{ a: { r: { t: 21 } } }, 29],
				y: {
					p: {
						e: 3,
						h: 3,
						o: { t: { h: { a: 137 } } }
					},
					s: 9
				}
			},
			i: {
				a: [{
					l: 24,
					m: [{ e: { t: { e: 5 } } }, 0],
					n: [{
						c: 18,
						i: 11,
						t: 46
					}, 24],
					p: { e: 4 },
					s: { s: 17 },
					t: {
						i: { v: 21 },
						r: { i: { c: 1 } },
						u: 21
					}
				}, 42],
				b: {
					e: [{ r: {
						a: 3,
						t: 4
					} }, 0],
					i: {
						a: 4,
						n: 3,
						t: {
							".": 4,
							e: 4
						}
					},
					l: [{ i: 3 }, 29],
					o: 19,
					r: [{ i: 94 }, 29],
					u: { n: 19 }
				},
				c: {
					a: {
						m: 18,
						p: 32,
						r: [{
							".": 21,
							a: 21
						}, 18],
						s: 6,
						y: 21
					},
					c: { u: 17 },
					e: { o: 18 },
					h: 18,
					i: [{
						d: 19,
						n: { a: 4 },
						p: [{ a: 3 }, 24]
					}, 25],
					l: { y: 21 },
					o: { c: 94 },
					r: [{
						a: 32,
						y: 21
					}, 43],
					t: {
						e: 1,
						u: [{ a: 111 }, 84]
					},
					u: {
						l: { a: 3 },
						m: 1,
						o: 4,
						r: 23
					}
				},
				d: [{
					a: {
						i: 21,
						n: { c: 4 }
					},
					d: 4,
					e: {
						a: { l: 11 },
						s: 0
					},
					i: [{
						a: {
							n: 4,
							r: 0
						},
						e: 19,
						o: [{
							u: 5,
							s: 1
						}, 3],
						t: 2,
						u: 4
					}, 24],
					l: { e: 23 },
					o: {
						m: 21,
						w: 3
					},
					r: 21,
					u: [{ o: 4 }, 24]
				}, 25],
				e: [{
					d: { e: 0 },
					g: { a: 113 },
					l: { d: 12 },
					n: {
						a: 67,
						e: 0,
						n: 19,
						t: { i: 23 }
					},
					r: { ".": 29 },
					s: {
						c: 23,
						t: 29
					},
					t: 23
				}, 112],
				f: {
					".": 18,
					e: { r: { o: 4 } },
					f: {
						e: { n: 5 },
						r: 1
					},
					i: {
						c: { ".": 18 },
						e: 23
					},
					l: 23,
					t: 18,
					a: { c: { e: { t: 137 } } }
				},
				g: [{
					a: { b: 5 },
					e: { r: { a: 3 } },
					h: { t: { i: 12 } },
					i: [{
						b: 23,
						l: 3,
						n: 3,
						t: 3
					}, 18],
					l: 28,
					o: [{
						r: 3,
						t: 4
					}, 24],
					r: { e: 19 },
					u: {
						i: 5,
						r: 2
					},
					n: { i: { t: [{ e: { r: 213 } }, 0] } }
				}, 25],
				h: 23,
				i: 114,
				j: [{ k: 21 }, 23],
				k: 18,
				l: {
					a: [{
						b: 93,
						d: { e: 21 },
						m: 94,
						r: { a: 5 }
					}, 29],
					e: {
						g: 23,
						r: 2,
						v: 17
					},
					f: 4,
					i: [{
						a: 3,
						b: 9,
						o: 3,
						s: { t: 1 },
						t: 25,
						z: 9
					}, 2],
					l: { a: { b: 5 } },
					n: 18,
					o: { q: 3 },
					t: { y: 1 },
					u: { r: 4 },
					v: 3
				},
				m: {
					a: {
						g: [{ e: 3 }, 21],
						r: { y: 5 }
					},
					e: {
						n: { t: { a: { r: 10 } } },
						t: 18
					},
					i: [{
						d: { a: 4 },
						l: { e: 5 },
						n: { i: 19 },
						t: 18
					}, 2],
					n: { i: 1 },
					o: { n: 23 },
					u: [{ l: { a: 3 } }, 24],
					p: { e: { d: { a: 201 } } }
				},
				n: {
					".": 25,
					a: {
						u: 83,
						v: 18
					},
					c: { e: {
						l: 36,
						r: 3
					} },
					d: [{ l: { i: { n: { g: 4 } } } }, 18],
					e: [{
						e: 23,
						r: { a: { r: 17 } },
						s: { s: 19 }
					}, 25],
					g: {
						a: 18,
						e: [{ n: 4 }, 18],
						i: 18,
						l: { i: { n: { g: 4 } } },
						o: 18,
						u: 18
					},
					i: [{
						".": 19,
						a: 21,
						o: 3,
						s: 2,
						t: {
							e: {
								".": 19,
								l: { y: { ".": 19 } }
							},
							i: { o: 32 },
							y: 3
						}
					}, 25],
					k: 18,
					l: 18,
					n: 25,
					o: [{
						c: 90,
						s: 0,
						t: 21
					}, 42],
					s: [{
						e: 3,
						u: { r: { a: 7 } }
					}, 25],
					t: {
						".": 25,
						h: 112
					},
					u: [{ s: 19 }, 2],
					y: 18,
					f: { r: { a: { s: 220 } } }
				},
				o: [{
					".": 18,
					g: {
						e: 17,
						r: 9
					},
					l: 29,
					m: 1,
					n: {
						a: { t: 11 },
						e: { r: { y: 0 } },
						i: 11
					},
					p: { h: 4 },
					r: { i: 11 },
					s: 21,
					t: {
						h: 4,
						i: 19,
						o: 1
					},
					u: { r: 21 }
				}, 25],
				p: [{
					e: 0,
					h: { r: { a: { s: 115 } } },
					i: [{ c: 1 }, 3],
					r: { e: 96 },
					u: { l: 3 }
				}, 25],
				q: { u: {
					a: 23,
					e: { f: 4 },
					i: {
						d: 3,
						t: 116
					}
				} },
				r: [{
					a: [{
						b: 0,
						c: 21
					}, 29],
					d: { e: 5 },
					e: {
						d: { e: 0 },
						f: 21,
						l: 117,
						s: 21
					},
					g: { i: 4 },
					i: [{
						d: { e: 5 },
						s: 1,
						t: { u: 11 },
						z: 118
					}, 2],
					m: { i: { n: 1 } },
					o: {
						g: 0,
						n: { ".": 32 }
					},
					u: { l: 4 },
					r: { e: { v: { o: { c: 221 } } } }
				}, 18],
				s: {
					".": 25,
					a: {
						g: 4,
						r: 3,
						s: 6
					},
					c: [{ h: 3 }, 119],
					e: [{ r: 3 }, 18],
					f: 27,
					h: {
						a: { n: 4 },
						o: {
							n: 3,
							p: 5
						}
					},
					i: {
						b: 3,
						d: 0,
						s: 19,
						t: { i: { v: 4 } }
					},
					k: 26,
					l: { a: { n: 36 } },
					m: { s: 18 },
					o: [{ m: { e: { r: 5 } } }, 24],
					p: [{
						i: 9,
						y: 1
					}, 2],
					s: [{
						a: { l: 1 },
						e: {
							n: 36,
							s: 1
						}
					}, 62],
					t: {
						a: { ".": 1 },
						e: 2,
						i: 2,
						l: { y: 0 },
						r: { a: { l: 18 } }
					},
					u: [{ s: 4 }, 24]
				},
				t: {
					a: {
						".": 18,
						b: { i: 0 },
						g: 21,
						m: 120,
						n: 23,
						t: 23
					},
					e: [{
						r: {
							a: 3,
							i: 19
						},
						s: [{ i: { m: { a: 29 } } }, 1]
					}, 25],
					h: [{ i: { l: 148 } }, 25],
					i: [{
						a: 18,
						c: [{
							a: 3,
							k: 31
						}, 22],
						g: 3,
						l: { l: 4 },
						m: 24,
						o: 25,
						s: [{ m: 21 }, 18],
						n: { e: { r: { a: { r: 158 } } } }
					}, 29],
					o: {
						m: 121,
						n: 18
					},
					r: {
						a: { m: 21 },
						y: 4
					},
					t: 18,
					u: {
						a: { t: 3 },
						d: 19,
						l: 3
					},
					z: { ".": 18 }
				},
				u: 29,
				v: [{
					e: {
						l: { l: 3 },
						n: { ".": 3 },
						r: {
							".": 83,
							s: { ".": 21 }
						}
					},
					i: {
						l: { ".": 4 },
						o: 4,
						t: 2
					},
					o: {
						r: {
							e: 19,
							o: 35
						},
						t: 83
					}
				}, 25],
				w: 56,
				x: { o: 1 },
				y: 18,
				z: {
					a: { r: 18 },
					i: 0,
					o: { n: { t: 32 } }
				}
			},
			j: {
				a: [{
					c: { q: 0 },
					p: [{ a: { n: { e: { s: 220 } } } }, 1],
					n: { u: { a: 12 } }
				}, 32],
				e: [{
					r: {
						s: 5,
						e: { m: 222 }
					},
					s: { t: {
						i: { e: 18 },
						y: 18
					} },
					w: 11
				}, 41],
				o: { p: 1 },
				u: { d: { g: 32 } }
			},
			k: {
				a: {
					".": 27,
					b: 23,
					g: 19,
					i: { s: 17 },
					l: 0
				},
				b: 29,
				e: {
					d: 24,
					e: 41,
					g: 1,
					l: { i: [{ n: { g: 223 } }, 4] },
					n: { d: 73 },
					r: 29,
					s: [{ t: { ".": 23 } }, 0],
					t: { y: 1 }
				},
				f: 23,
				h: 1,
				i: [{
					".": 32,
					c: 122,
					l: {
						l: 21,
						o: 6
					},
					m: 21,
					n: {
						".": 21,
						d: { e: 0 },
						e: {
							s: { s: 19 },
							t: { i: { c: 224 } }
						},
						g: 0
					},
					p: 1,
					s: [{ h: 19 }, 0]
				}, 29],
				k: 1,
				l: [{
					e: { y: 18 },
					y: 18
				}, 29],
				m: 29,
				n: {
					e: { s: 19 },
					o: 69
				},
				o: {
					r: 4,
					s: { h: 17 },
					u: 23,
					v: { i: { a: { n: 41 } } }
				},
				r: { o: { n: 5 } },
				s: [{
					c: 21,
					l: 1,
					y: 21,
					h: { a: 23 }
				}, 101],
				t: 19,
				w: 29
			},
			l: {
				a: {
					b: {
						i: { c: 11 },
						o: 21
					},
					c: { i: [{ e: 225 }, 17] },
					d: {
						e: 21,
						y: 3
					},
					g: { n: 0 },
					m: { o: 11 },
					n: {
						d: [{ l: 0 }, 27],
						e: { t: 5 },
						t: { e: 0 }
					},
					r: {
						g: 0,
						i: 11,
						c: { e: { n: 176 } }
					},
					s: { e: 0 },
					t: {
						a: { n: 4 },
						e: { l: { i: 18 } },
						i: { v: 18 }
					},
					v: [{ a: 95 }, 18],
					i: { n: { e: { s: { s: 226 } } } }
				},
				b: [{ i: { n: 17 } }, 42],
				c: [{
					e: 0,
					i: 23,
					h: {
						a: { i: 23 },
						i: { l: { d: 227 } }
					}
				}, 101],
				d: [{
					e: [{ r: {
						e: 1,
						i: 1
					} }, 24],
					i: [{ s: 4 }, 0],
					r: [{ i: 21 }, 23]
				}, 25],
				e: {
					a: [{
						d: { e: { r: { ".": 183 } } },
						s: { a: 228 }
					}, 9],
					b: { i: 1 },
					f: { t: 6 },
					g: {
						".": 32,
						g: 32,
						e: { n: { d: { r: { e: 230 } } } }
					},
					m: { a: { t: [{ i: { c: 5 } }, 1] } },
					n: {
						".": 18,
						c: 27,
						e: { ".": 32 },
						t: 41,
						o: { i: { d: 78 } }
					},
					p: {
						h: 3,
						r: 1
					},
					r: {
						a: { b: 6 },
						e: 0,
						g: 27,
						i: 68,
						o: 21
					},
					s: [{
						c: { o: 4 },
						q: 32,
						s: [{ ".": 32 }, 27]
					}, 8],
					v: {
						a: 23,
						e: { r: {
							".": 0,
							a: 0,
							s: 0
						} }
					},
					y: [{ e: 18 }, 27],
					c: { t: { a: { b: 229 } } }
				},
				f: [{ r: 19 }, 25],
				g: [{
					a: [{ r: 12 }, 19],
					e: { s: 21 },
					o: 11
				}, 80],
				h: 48,
				i: {
					a: {
						g: 1,
						m: 9,
						r: { i: { z: 6 } },
						s: 1,
						t: { o: 1 }
					},
					b: { i: 4 },
					c: {
						i: { o: 32 },
						o: { r: 1 },
						s: 18,
						t: { ".": 18 },
						u: 21,
						y: 23
					},
					d: {
						a: 23,
						e: { r: 5 },
						i: 27
					},
					f: {
						e: { r: 11 },
						f: 21,
						l: 1
					},
					g: {
						a: { t: { e: 32 } },
						h: 27,
						r: { a: 1 }
					},
					k: 27,
					l: 123,
					m: {
						b: { l: 0 },
						i: 11,
						o: 1,
						p: 90
					},
					n: {
						a: 21,
						e: [{ a: 11 }, 124],
						i: 11,
						k: { e: { r: 6 } }
					},
					o: { g: 4 },
					q: 125,
					s: { p: 0 },
					t: [{
						".": 24,
						i: { c: {
							a: 32,
							s: 108
						} },
						h: { o: { g: 204 } }
					}, 29],
					v: { e: { r: 11 } },
					z: 29
				},
				j: 18,
				k: { a: [{
					l: 23,
					t: 0
				}, 11] },
				l: [{
					a: { w: 21 },
					e: [{
						a: 19,
						c: 23,
						g: 23,
						l: 23,
						n: 73,
						t: 73
					}, 24],
					i: [{
						n: [{ a: 19 }, 126],
						s: { h: 231 }
					}, 9],
					o: [{
						q: { u: { i: 10 } },
						u: { t: 4 },
						w: 19
					}, 1],
					f: { l: 2 }
				}, 29],
				m: [{
					e: { t: 19 },
					i: { n: { g: 3 } },
					o: {
						d: 21,
						n: [{ e: { l: { l: 232 } } }, 17]
					}
				}, 25],
				n: 81,
				o: {
					".": 27,
					b: {
						a: { l: 5 },
						o: { t: { o: 233 } }
					},
					c: { i: 1 },
					f: 18,
					g: {
						i: { c: 27 },
						o: 19,
						u: 27,
						e: { s: { ".": 9 } }
					},
					m: { e: { r: 11 } },
					n: {
						g: 32,
						i: [{ z: 127 }, 0]
					},
					o: { d: 6 },
					p: {
						e: { ".": 32 },
						i: 11,
						m: 23
					},
					r: {
						a: [{ t: { o: 1 } }, 17],
						i: { e: 4 },
						o: { u: 5 }
					},
					s: {
						".": 32,
						e: { t: 5 },
						o: { p: { h: {
							i: { z: 32 },
							y: 32
						} } },
						t: 0
					},
					t: { a: 1 },
					u: {
						n: { d: 6 },
						t: 25
					},
					v: 18,
					a: { d: { e: {
						d: { ".": 17 },
						r: { ".": 183 }
					} } }
				},
				p: [{
					a: { b: 5 },
					h: {
						a: 23,
						i: 19
					},
					i: {
						n: { g: 4 },
						t: 23
					},
					l: 21,
					r: 19
				}, 25],
				r: 43,
				s: [{
					c: 21,
					e: 24,
					i: { e: 21 }
				}, 81],
				t: [{
					a: {
						g: 4,
						n: { e: 7 }
					},
					e: [{
						n: 17,
						r: { a: 36 },
						a: 23
					}, 29],
					h: { i: [{ l: { y: 148 } }, 11] },
					i: {
						e: { s: { ".": 19 } },
						s: 17
					},
					r: 29,
					u: [{ r: { a: 12 } }, 8]
				}, 18],
				u: {
					a: 4,
					b: { r: 3 },
					c: {
						h: 17,
						i: 3
					},
					e: {
						n: 3,
						p: 15
					},
					f: 0,
					i: { d: 4 },
					m: {
						a: 1,
						i: 32,
						n: {
							".": 19,
							i: { a: 32 }
						},
						b: { i: { a: { ".": 235 } } }
					},
					o: [{ r: 11 }, 3],
					p: 18,
					s: {
						s: 17,
						t: { e: 11 }
					},
					t: 41,
					n: { k: { e: { r: 234 } } }
				},
				v: { e: {
					n: 19,
					t: 128
				} },
				w: 42,
				y: [{
					a: 18,
					b: 18,
					m: { e: 4 },
					n: { o: 3 },
					s: [{
						e: 19,
						t: { y: { r: 4 } }
					}, 58],
					g: { a: { m: { i: 236 } } }
				}, 41]
			},
			m: {
				a: [{
					b: 25,
					c: {
						a: 9,
						h: { i: { n: { e: 4 } } },
						l: 1
					},
					g: {
						i: { n: 5 },
						n: 32
					},
					h: 25,
					i: { d: 6 },
					l: {
						d: 18,
						i: {
							g: 3,
							n: 4
						},
						l: { i: 0 },
						t: { y: 0 },
						a: { p: 222 }
					},
					n: {
						i: {
							a: 32,
							s: 5,
							z: 11
						},
						".": 24,
						u: { s: { c: 237 } }
					},
					p: [{ h: { r: { o: 244 } } }, 18],
					r: {
						i: {
							n: { e: { ".": 4 } },
							z: 4
						},
						l: { y: 0 },
						v: 11,
						g: { i: { n: 238 } }
					},
					s: {
						c: { e: 4 },
						e: 0,
						t: 15
					},
					t: {
						e: 32,
						h: 12,
						i: {
							s: 3,
							z: { a: 18 }
						}
					}
				}, 41],
				b: [{
					a: { t: 129 },
					i: {
						l: 19,
						n: { g: 83 },
						v: 0
					}
				}, 43],
				c: 56,
				e: {
					".": 18,
					d: [{
						".": 18,
						i: {
							a: 32,
							e: 3,
							c: [{ i: { n: 152 } }, 84],
							o: { c: 239 }
						},
						y: 108
					}, 25],
					g: [{ r: { a: { n: 240 } } }, 9],
					l: {
						o: { n: 5 },
						t: 0
					},
					m: [{ o: 130 }, 9],
					n: [{
						a: [{ c: 5 }, 0],
						d: { e: 0 },
						e: 18,
						i: 0,
						s: [{ u: 7 }, 17],
						t: [{ e: 0 }, 27],
						".": 24
					}, 41],
					o: { n: 4 },
					r: { s: { a: 19 } },
					s: [{ t: { i: 27 } }, 25],
					t: {
						a: [{ l: 11 }, 1],
						e: 2,
						h: { i: 4 },
						r: [{
							i: {
								c: 32,
								e: 4
							},
							y: 3
						}, 21]
					},
					v: 1
				},
				f: 43,
				h: 25,
				i: {
					".": 32,
					a: 3,
					d: {
						a: [{ b: 241 }, 0],
						g: 0
					},
					g: 0,
					l: {
						i: {
							a: 27,
							e: 108,
							t: { a: 27 }
						},
						l: [{
							a: { g: 208 },
							i: { l: { i: 59 } }
						}, 21]
					},
					n: {
						a: 0,
						d: 27,
						e: { e: 19 },
						g: { l: [{
							i: 5,
							y: 19
						}, 21] },
						t: 0,
						u: [{ t: { e: {
							r: 242,
							s: { t: 242 }
						} } }, 21],
						i: { s: { ".": 174 } }
					},
					o: { t: 17 },
					s: [{
						e: { r: { ".": 0 } },
						l: 5,
						t: {
							i: 0,
							r: { y: 19 }
						}
					}, 24],
					t: { h: 18 },
					z: 24
				},
				k: 18,
				l: 43,
				m: [{ a: {
					r: { y: 5 },
					b: 243
				} }, 29],
				n: [{
					a: 1,
					i: { n: 21 },
					o: 1
				}, 43],
				o: [{
					c: { r: [{ a: { t: [{ i: { z: 32 } }, 245] } }, 18] },
					d: 131,
					g: { o: 1 },
					i: { s: [{ e: 5 }, 84] },
					k: 18,
					l: { e: {
						s: { t: 4 },
						c: 246
					} },
					m: { e: 3 },
					n: {
						e: {
							t: 5,
							y: { l: 247 }
						},
						g: { e: 5 },
						i: {
							a: 12,
							s: {
								m: 0,
								t: 0
							},
							z: 3
						},
						o: {
							l: 36,
							c: { h: 12 },
							e: { n: 171 },
							s: 249
						},
						y: { ".": 3 }
					},
					r: [{
						a: { ".": 18 },
						o: { n: { i: { s: 248 } } }
					}, 9],
					s: [{
						e: { y: 4 },
						p: 3
					}, 8],
					t: { h: [{ e: { t: 250 } }, 12] },
					u: {
						f: 19,
						s: [{ i: { n: 98 } }, 27]
					},
					v: 9,
					e: { l: { a: { s: 167 } } }
				}, 41],
				p: [{
					a: { r: {
						a: [{ b: 5 }, 7],
						i: 6
					} },
					e: { t: 23 },
					h: { a: { s: 36 } },
					i: [{
						a: 0,
						e: { s: 4 },
						n: 34,
						r: 19,
						s: 4
					}, 24],
					o: {
						r: { i: 11 },
						s: { i: { t: { e: 6 } } },
						u: { s: 21 },
						v: 6
					},
					t: { r: 1 },
					y: 24
				}, 43],
				r: 47,
				s: [{
					h: [{ a: { c: { k: 251 } } }, 21],
					i: 19
				}, 101],
				t: 18,
				u: [{
					l: {
						a: { r: 49 },
						t: [{ i: [{ u: 252 }, 54] }, 32]
					},
					m: 27,
					n: 8,
					p: 18,
					u: 1,
					d: { r: { o: 9 } }
				}, 41],
				w: 18
			},
			n: {
				a: [{
					b: [{ u: 21 }, 81],
					c: {
						".": 18,
						a: 1,
						t: 19
					},
					g: { e: { r: { ".": 5 } } },
					k: 0,
					l: {
						i: [{ a: 4 }, 1],
						t: 18
					},
					m: { i: { t: 4 } },
					n: [{
						c: { i: 36 },
						i: { t: 0 },
						k: 17
					}, 24],
					r: {
						c: [{ h: { s: { ".": 73 } } }, 11],
						e: 18,
						i: 11,
						l: 0,
						m: 19
					},
					s: [{
						c: 0,
						t: { i: 5 }
					}, 21],
					t: [{
						a: { l: 3 },
						o: { m: { i: { z: 6 } } }
					}, 24],
					u: [{
						s: { e: 11 },
						t: 27
					}, 24],
					v: { e: 0 }
				}, 41],
				b: 80,
				c: {
					a: { r: 6 },
					e: { s: { ".": 21 } },
					h: {
						a: 23,
						e: {
							o: 19,
							s: { t: 253 }
						},
						i: {
							l: 19,
							s: 23
						}
					},
					i: {
						n: 2,
						t: 1
					},
					o: { u: { r: { a: 7 } } },
					r: 29,
					u: 29
				},
				d: {
					a: {
						i: 21,
						n: 19
					},
					e: [{ s: { t: { ".": 4 } } }, 29],
					i: {
						b: 0,
						f: 79,
						t: 29,
						z: 23,
						e: { c: { k: 29 } }
					},
					u: {
						c: 19,
						r: 0
					},
					w: { e: 9 },
					t: { h: { r: 3 } }
				},
				e: {
					".": 25,
					a: { r: 23 },
					b: [{
						u: 11,
						a: { c: { k: 3 } }
					}, 9],
					c: [{ k: 32 }, 9],
					d: 25,
					g: {
						a: { t: [{ i: { v: 5 } }, 1] },
						e: 32
					},
					l: {
						a: 1,
						i: { z: 5 }
					},
					m: {
						i: 4,
						o: 1
					},
					n: [{ e: 18 }, 41],
					o: 27,
					p: { o: 1 },
					q: 9,
					r: [{
						a: {
							b: 6,
							r: 21
						},
						e: 24,
						i: 132,
						r: 0
					}, 29],
					s: [{
						".": 25,
						p: 18,
						t: 25,
						w: 18,
						k: { i: 119 }
					}, 41],
					t: { i: { c: 27 } },
					v: [{ e: 19 }, 1],
					w: 1
				},
				f: [{ i: { n: { i: { t: { e: { s: 226 } } } } } }, 23],
				g: {
					a: { b: 21 },
					e: {
						l: 23,
						n: { e: [{ s: 5 }, 133] },
						r: {
							e: 19,
							i: 23
						}
					},
					h: {
						a: 4,
						o: 2
					},
					i: {
						b: 23,
						n: 2,
						t: 19
					},
					l: { a: 21 },
					o: { v: 17 },
					s: {
						h: 4,
						p: { r: 2 }
					},
					u: [{ m: 21 }, 29],
					y: 24
				},
				h: [{
					a: [{ b: 12 }, 0],
					e: 0
				}, 80],
				i: {
					a: [{
						n: [{ ".": 114 }, 3],
						p: 1
					}, 68],
					b: {
						a: 3,
						l: 1
					},
					d: [{ i: 4 }, 1],
					e: { r: 1 },
					f: { i: [{ c: { a: { t: 4 } } }, 9] },
					g: { r: 19 },
					k: 0,
					m: [{ i: { z: 3 } }, 29],
					n: [{
						e: { ".": 32 },
						g: 0
					}, 29],
					o: 1,
					s: {
						".": 32,
						t: { a: 0 }
					},
					t: [{
						h: 21,
						i: { o: 27 },
						o: { r: 23 },
						r: 3
					}, 24]
				},
				j: 29,
				k: [{
					e: {
						r: { o: 19 },
						t: 23
					},
					i: { n: 3 },
					l: 29,
					r: { u: { p: 3 } }
				}, 44],
				l: [{ e: { s: { s: 19 } } }, 43],
				m: [{ e: [{ t: 17 }, 0] }, 19],
				n: [{
					e: 0,
					i: {
						a: { l: 11 },
						v: 0
					}
				}, 101],
				o: {
					b: { l: [{ e: 3 }, 0] },
					c: {
						l: 19,
						e: { r: { o: { s: 254 } } }
					},
					d: 66,
					e: 27,
					g: [{ e: 17 }, 18],
					i: { s: { i: 6 } },
					l: {
						i: 134,
						o: { g: { i: { s: 32 } } }
					},
					m: {
						i: {
							c: 27,
							z: 108,
							s: { t: 82 }
						},
						o: 1,
						y: 3,
						a: { l: 214 },
						e: { n: { o: 194 } }
					},
					n: [{
						a: { g: 0 },
						i: [{
							z: 19,
							s: { o: 255 }
						}, 5],
						e: { q: 15 }
					}, 1],
					p: [{ o: { l: {
						i: 135,
						y: { ".": 256 }
					} } }, 18],
					r: { a: {
						b: 5,
						r: { y: 1 }
					} },
					s: {
						c: 18,
						e: 0,
						t: 5
					},
					t: { a: 4 },
					u: [{ n: 27 }, 41],
					v: { e: {
						l: 136,
						m: { b: 2 }
					} },
					w: { l: 12 }
				},
				p: [{
					i: 0,
					r: { e: { c: 17 } }
				}, 72],
				q: 29,
				r: [{ u: 0 }, 29],
				s: [{
					a: {
						b: 4,
						t: { i: 36 }
					},
					c: [{ e: { i: { v: 4 } } }, 1],
					e: [{ s: 83 }, 24],
					i: {
						d: 137,
						g: 17
					},
					l: 24,
					m: [{ o: { o: 1 } }, 3],
					o: { c: 21 },
					p: {
						e: 1,
						i: 19
					},
					t: { a: { b: { l: 6 } } }
				}, 81],
				t: [{
					a: { b: 0 },
					e: { r: { s: 12 } },
					i: [{
						b: 19,
						e: { r: 0 },
						f: 8,
						n: {
							e: 23,
							g: 83
						},
						p: 0
					}, 9],
					r: {
						o: { l: { l: { i: 7 } } },
						e: { p: 137 }
					},
					s: 1,
					u: { m: { e: 11 } }
				}, 29],
				u: {
					a: 2,
					d: 1,
					e: { n: 4 },
					f: { f: { e: 0 } },
					i: {
						n: 23,
						t: 50
					},
					m: [{
						e: 2,
						i: 19
					}, 21],
					n: 138,
					o: 23,
					t: { r: 3 }
				},
				v: 74,
				w: 72,
				y: {
					m: 0,
					p: 0
				},
				z: [{ a: 23 }, 18]
			},
			o: {
				a: [{
					d: 11,
					l: { e: { s: 108 } },
					r: { d: 12 },
					s: {
						e: 0,
						t: { e: 6 }
					},
					t: { i: 5 }
				}, 18],
				b: {
					a: {
						b: 35,
						r: 19
					},
					e: { l: 0 },
					i: [{ n: [{ g: 4 }, 24] }, 29],
					r: 23,
					u: { l: 3 },
					l: { i: { g: 189 } }
				},
				c: {
					e: 29,
					h: [{
						e: { t: 23 },
						a: { s: 23 }
					}, 0],
					i: {
						f: 12,
						l: 21
					},
					l: { a: { m: 21 } },
					o: { d: 21 },
					r: {
						a: {
							c: 3,
							t: { i: { z: 4 } }
						},
						e: 12,
						i: { t: 32 }
					},
					t: { o: { r: { a: 7 } } },
					u: {
						l: { a: 3 },
						r: { e: 19 }
					}
				},
				d: {
					d: { e: { d: 4 } },
					i: {
						c: 3,
						o: 11,
						t: { i: { c: 137 } }
					},
					o: [{ r: 12 }, 139],
					u: { c: { t: {
						".": 4,
						s: 4
					} } },
					e: { l: { l: { i: 12 } } }
				},
				e: {
					l: 21,
					n: { g: 19 },
					r: [{ s: { t: 257 } }, 23],
					t: { a: 1 },
					v: 23
				},
				f: { i: [{ t: {
					e: 4,
					t: 17
				} }, 24] },
				g: {
					a: {
						r: 121,
						t: {
							i: { v: 4 },
							o: 21
						}
					},
					e: [{
						n: { e: 19 },
						o: 19,
						r: 21
					}, 29],
					i: {
						e: 23,
						s: 140,
						t: 3
					},
					l: [{ y: 79 }, 21],
					n: { i: { z: 27 } },
					r: { o: 21 },
					u: { i: 5 },
					y: [{ n: 25 }, 41]
				},
				h: [{ a: { b: 6 } }, 74],
				i: [{
					c: { e: { s: 11 } },
					d: { e: { r: 3 } },
					f: { f: 17 },
					g: 0,
					l: { e: { t: 4 } },
					n: {
						g: 23,
						t: { e: { r: 6 } }
					},
					s: {
						m: 19,
						o: { n: 4 },
						t: { e: { n: 6 } }
					},
					t: { e: { r: 3 } }
				}, 9],
				j: 19,
				k: [{
					e: {
						n: 23,
						s: { t: 15 }
					},
					i: { e: 4 }
				}, 25],
				l: {
					a: [{
						n: 21,
						s: { s: 36 }
					}, 29],
					d: [{ e: 15 }, 9],
					e: {
						r: 3,
						s: {
							c: 23,
							t: { e: { r: 88 } }
						},
						t: 23
					},
					f: { i: 1 },
					i: [{
						a: 23,
						c: { e: 23 },
						d: { ".": 4 },
						f: 73,
						l: 19,
						n: { g: 3 },
						o: 19,
						s: {
							".": 19,
							h: 3
						},
						t: {
							e: 19,
							i: { o: 19 }
						},
						v: 19,
						g: { o: { p: { o: 258 } } }
					}, 9],
					l: { i: { e: 17 } },
					o: {
						g: { i: { z: 4 } },
						r: 0,
						n: { o: { m: 259 } }
					},
					p: { l: 4 },
					t: 9,
					u: {
						b: 3,
						m: { e: 3 },
						n: 3,
						s: 19
					},
					v: 9,
					y: 24
				},
				m: {
					a: {
						h: 4,
						l: 5,
						t: { i: { z: 4 } }
					},
					b: {
						e: 9,
						l: 1
					},
					e: [{
						n: { a: 3 },
						r: { s: { e: 4 } },
						t: [{ r: { y: 4 } }, 21],
						c: { h: { a: 260 } }
					}, 24],
					i: {
						a: 23,
						c: {
							".": 3,
							a: 3
						},
						d: 19,
						n: [{ i: 19 }, 2]
					},
					m: { e: { n: { d: 32 } } },
					o: {
						g: { e: 0 },
						n: 21
					},
					p: {
						i: 3,
						r: { o: 7 }
					}
				},
				n: [{
					a: [{
						c: 1,
						n: 23
					}, 2],
					c: [{ i: { l: 27 } }, 2],
					d: [{ o: 4 }, 25],
					e: {
						n: 23,
						s: { t: 4 }
					},
					g: { u: 1 },
					i: {
						c: 2,
						o: 23,
						s: 2,
						u: 19
					},
					k: { e: { y: 3 } },
					o: {
						d: { i: 1 },
						m: {
							y: 3,
							i: { c: 137 }
						},
						r: { m: { a: 23 } },
						t: { o: { n: 261 } },
						u: 23
					},
					s: [{
						p: { i: [{ r: { a: 10 } }, 36] },
						u: 17
					}, 3],
					t: {
						e: { n: 36 },
						i: [{ f: 7 }, 93]
					},
					u: { m: 4 },
					v: { a: 6 }
				}, 24],
				o: [{
					d: {
						e: 5,
						i: 5
					},
					k: 1,
					p: { i: 11 },
					r: { d: 23 },
					s: { t: 6 }
				}, 9],
				p: {
					a: 24,
					e: {
						d: 5,
						r: [{ a: [{ g: 18 }, 27] }, 2]
					},
					h: [{
						a: { n: 19 },
						e: { r: 19 }
					}, 25],
					i: {
						n: { g: 3 },
						t: 23,
						s: { m: { ".": 2 } }
					},
					o: {
						n: 19,
						s: { i: 21 }
					},
					r: 29,
					u: 2,
					y: 5
				},
				q: 29,
				r: {
					a: [{
						".": 19,
						g: 83,
						l: { i: { z: 4 } },
						n: { g: { e: 4 } }
					}, 29],
					e: {
						a: [{ l: 19 }, 5],
						i: 3,
						s: {
							h: 5,
							t: { ".": 4 }
						},
						w: 17
					},
					g: { u: 1 },
					i: {
						a: 56,
						c: { a: 3 },
						l: 19,
						n: 2,
						o: 29,
						t: { y: 3 },
						u: 23
					},
					m: { i: 9 },
					n: { e: 8 },
					o: {
						f: 19,
						u: { g: 3 }
					},
					p: { e: 4 },
					r: { h: 27 },
					s: {
						e: [{ n: 5 }, 1],
						t: 17
					},
					t: {
						h: {
							i: 3,
							y: 3,
							o: { n: { i: { t: 262 } } },
							r: { i: 137 }
						},
						y: 1,
						i: { v: { e: { l: { y: 4 } } } }
					},
					u: { m: 19 },
					y: 29
				},
				s: {
					a: { l: 3 },
					c: [{
						e: 1,
						o: { p: [{ i: 18 }, 23] },
						r: 19
					}, 9],
					i: {
						e: 95,
						t: {
							i: { v: 4 },
							o: 3,
							y: 3
						},
						u: 0
					},
					l: 1,
					o: 24,
					p: {
						a: 1,
						o: 1,
						h: { e: { r: 83 } }
					},
					t: {
						a: [{ t: { i: 19 } }, 9],
						i: {
							l: 4,
							t: 4
						}
					}
				},
				t: {
					a: { n: 21 },
					e: {
						l: { e: { g: 36 } },
						r: {
							".": 3,
							s: 4
						},
						s: [{ t: {
							e: { r: 263 },
							o: { r: 264 }
						} }, 21]
					},
					h: [{
						e: {
							s: { i: 5 },
							o: { s: 265 }
						},
						i: 14
					}, 18],
					i: {
						c: {
							".": 3,
							a: 4,
							e: 23
						},
						f: 23,
						s: 23
					},
					o: { s: 5 }
				},
				u: [{
					b: {
						l: 3,
						a: { d: { o: 116 } }
					},
					c: { h: { i: 6 } },
					e: { t: 4 },
					l: 1,
					n: {
						c: { e: { r: 6 } },
						d: 8
					},
					v: 4
				}, 9],
				v: {
					e: {
						n: 1,
						r: {
							n: { e: 17 },
							s: 12,
							t: 1
						}
					},
					i: {
						s: 23,
						t: { i: 36 },
						a: { n: { ".": 266 } }
					},
					o: { l: 60 }
				},
				w: {
					d: { e: { r: 3 } },
					e: {
						l: 3,
						s: { t: 4 }
					},
					i: 2,
					n: { i: 5 },
					o: 21
				},
				y: { a: 2 },
				x: { i: { d: { i: { c: 267 } } } }
			},
			p: {
				a: [{
					c: {
						a: 1,
						e: 1,
						t: 0
					},
					d: 21,
					g: { a: {
						n: 32,
						t: 23
					} },
					i: [{ n: 17 }, 21],
					l: [{ m: { a: { t: 268 } } }, 21],
					n: {
						a: 0,
						e: { l: 11 },
						t: { y: 0 },
						y: 3
					},
					p: [{ u: 1 }, 2],
					r: {
						a: {
							b: { l: 6 },
							g: {
								e: 5,
								r: { a: 269 }
							},
							l: { e: 228 },
							m: [{ e: 12 }, 36]
						},
						d: { i: 5 },
						e: [{ l: 5 }, 27],
						i: [{ s: 0 }, 28]
					},
					t: {
						e: [{ r: 4 }, 9],
						h: {
							i: { c: 32 },
							y: 4
						},
						r: { i: { c: 1 } }
					},
					v: 0,
					y: 27
				}, 41],
				b: 43,
				d: 1,
				e: {
					".": 18,
					a: [{ r: { l: 17 } }, 138],
					c: 9,
					d: [{
						e: 27,
						i: [{
							a: 36,
							c: 0
						}, 27]
					}, 37],
					e: [{
						d: 0,
						v: 208
					}, 21],
					k: 0,
					l: {
						a: 1,
						i: { e: 17 }
					},
					n: {
						a: { n: 1 },
						c: 21,
						t: { h: 0 }
					},
					o: { n: 4 },
					r: {
						a: {
							".": 21,
							b: { l: 6 },
							g: 21
						},
						i: [{ s: { t: 6 } }, 21],
						m: {
							a: { l: 0 },
							e: 7
						},
						n: 21,
						o: 11,
						t: { i: 11 },
						u: 4,
						v: 15
					},
					t: [{
						e: { n: 4 },
						i: { z: 4 }
					}, 9]
				},
				f: 18,
				g: 18,
				h: {
					".": 18,
					a: { r: { i: 6 } },
					e: {
						n: { o: 11 },
						r: 1,
						s: { ".": 1 }
					},
					i: {
						c: 2,
						e: 32,
						n: { g: 4 },
						s: { t: { i: 32 } },
						z: 27,
						l: { a: {
							n: { t: 168 },
							t: { e: { l: 270 } }
						} }
					},
					l: 9,
					o: {
						b: 27,
						n: {
							e: 27,
							i: 32
						},
						r: 0
					},
					s: 18,
					t: 3,
					u: 32,
					y: 41
				},
				i: {
					a: [{ n: 17 }, 3],
					c: {
						i: { e: 1 },
						y: 1,
						a: { d: 271 }
					},
					d: [{
						a: 19,
						e: 3,
						i: 32
					}, 21],
					e: {
						c: 27,
						n: 3
					},
					g: { r: { a: { p: 1 } } },
					l: { o: 3 },
					n: [{
						".": 21,
						d: 17,
						o: 21
					}, 9],
					o: [{ n: 17 }, 141],
					t: {
						h: [{ a: 4 }, 23],
						u: 9
					}
				},
				k: 142,
				l: [{
					a: {
						n: 27,
						s: { t: 6 }
					},
					i: {
						a: 11,
						e: { r: 5 },
						g: 18,
						n: [{ a: { r: 5 } }, 0],
						c: { a: { b: 208 } }
					},
					o: { i: 17 },
					u: { m: [{ b: 17 }, 0] }
				}, 143],
				m: 43,
				n: 48,
				o: {
					c: 1,
					d: { ".": 32 },
					e: {
						m: 4,
						t: 144
					},
					g: 145,
					i: { n: [{
						t: 32,
						c: { a: 12 }
					}, 84] },
					l: {
						y: {
							t: 6,
							e: 137,
							p: { h: { o: { n: { o: 272 } } } }
						},
						e: { ".": 41 }
					},
					n: { i: 1 },
					p: 1,
					r: [{ y: 1 }, 124],
					s: [{ s: 15 }, 41],
					t: [{ a: 1 }, 21],
					u: { n: 32 }
				},
				p: [{
					a: { r: { a: 5 } },
					e: [{
						d: 21,
						l: 19,
						n: 23,
						r: 23,
						t: 23
					}, 24],
					o: { s: { i: { t: { e: 5 } } } }
				}, 43],
				r: [{
					a: { y: { e: 17 } },
					e: {
						c: {
							i: 32,
							o: 5
						},
						e: { m: 11 },
						f: { a: { c: 6 } },
						l: { a: 0 },
						r: 11,
						s: {
							e: 23,
							s: 27,
							p: { l: { i: 84 } }
						},
						t: { e: { n: 5 } },
						v: 11,
						m: { a: { c: 273 } },
						n: { e: { u: 15 } }
					},
					i: {
						e: 53,
						n: { t: 146 },
						s: [{ o: 12 }, 0]
					},
					o: {
						c: {
							a: 23,
							e: { s: { s: 8 } },
							i: { t: { y: { ".": 274 } } }
						},
						f: { i: { t: 6 } },
						l: 11,
						s: { e: 12 },
						t: 15,
						g: { e: 208 }
					}
				}, 9],
				s: [{
					e: [{ u: { d: [{ o: {
						d: 276,
						f: 276
					} }, 275] } }, 24],
					h: 1,
					i: { b: 21 }
				}, 81],
				t: [{
					a: { b: 134 },
					e: 24,
					h: 24,
					i: { m: 11 },
					u: { r: 0 },
					w: 21,
					o: { m: { a: { t: 277 } } },
					r: { o: { l: 278 } }
				}, 42],
				u: {
					b: [{ e: { s: { c: 181 } } }, 11],
					e: 0,
					f: 0,
					l: { c: 11 },
					m: 1,
					n: 9,
					r: { r: 0 },
					s: 32,
					t: [{
						e: [{ r: 11 }, 32],
						r: 3,
						t: {
							e: { d: 0 },
							i: { n: 0 }
						}
					}, 9]
				},
				w: 23
			},
			q: { u: [{
				a: {
					v: 5,
					i: { n: { t: { e: 279 } } },
					s: { i: [{
						r: 281,
						s: 281
					}, 280] }
				},
				e: {
					".": 25,
					r: 27,
					t: 27
				},
				i: {
					n: { t: { e: { s: { s: 282 } } } },
					v: { a: { r: 14 } }
				}
			}, 9] },
			r: {
				a: {
					b: [{
						i: 3,
						o: { l: {
							i: { c: 29 },
							o: { i: 236 }
						} }
					}, 25],
					c: {
						h: {
							e: 17,
							u: 3
						},
						l: 19
					},
					f: {
						f: { i: 5 },
						t: 0
					},
					i: 24,
					l: { o: 1 },
					m: {
						e: {
							t: [{ r: { i: { z: 283 } } }, 11],
							n: 24
						},
						i: 24,
						o: { u: 3 }
					},
					n: {
						e: { o: 6 },
						g: { e: 0 },
						i: 21,
						o: 4,
						h: { a: { s: 167 } }
					},
					p: {
						e: { r: 11 },
						h: { y: 27 }
					},
					r: {
						c: 5,
						e: [{ f: 5 }, 17],
						i: { l: 18 }
					},
					s: 24,
					t: { i: { o: { n: 115 } } },
					u: { t: 0 },
					v: {
						a: { i: 4 },
						e: { l: 11 }
					},
					z: { i: { e: 4 } },
					d: { i: {
						g: 127,
						o: { g: 249 }
					} },
					o: { r: 2 }
				},
				b: [{
					a: {
						b: 21,
						g: 21
					},
					i: [{
						f: 0,
						n: [{
							e: 19,
							g: {
								".": 4,
								e: 284
							}
						}, 24]
					}, 8],
					o: 1
				}, 29],
				c: [{
					e: [{ n: 17 }, 24],
					h: {
						a: 23,
						e: { r: 0 }
					},
					i: {
						b: 90,
						t: 1
					},
					u: { m: 12 }
				}, 29],
				d: {
					a: { l: 21 },
					i: [{
						a: 0,
						e: { r: 0 },
						n: [{ g: 3 }, 17]
					}, 9]
				},
				e: {
					".": 25,
					a: {
						l: 2,
						n: 3,
						r: { r: 4 },
						v: 32,
						w: 1
					},
					b: { r: { a: { t: 19 } } },
					c: {
						o: {
							l: { l: 5 },
							m: { p: { e: 5 } }
						},
						r: { e: 1 },
						i: { p: { r: 285 } },
						t: { a: { n: { g: 286 } } }
					},
					d: [{
						e: 2,
						i: {
							s: 3,
							t: 5
						}
					}, 37],
					f: {
						a: { c: 1 },
						e: [{ r: { ".": 4 } }, 9],
						i: 3,
						y: 1
					},
					g: { i: { s: 11 } },
					i: { t: 4 },
					l: {
						i: 2,
						u: 4
					},
					n: { t: {
						a: 90,
						e: 0
					} },
					o: 2,
					p: {
						i: { n: 4 },
						o: { s: { i: 1 } },
						u: 2
					},
					r: [{
						i: 21,
						o: 17,
						u: 4
					}, 147],
					s: {
						".": 21,
						p: { i: 1 },
						s: { i: { b: 6 } },
						t: [{
							a: { l: 4 },
							r: 3
						}, 8]
					},
					t: {
						e: { r: 1 },
						i: { z: 96 },
						r: { i: [{ b: { u: 85 } }, 3] }
					},
					u: [{ t: { i: 4 } }, 8],
					v: [{
						a: { l: 1 },
						e: {
							l: 11,
							r: {
								".": 30,
								s: 4,
								t: 4
							}
						},
						i: { l: 4 },
						o: { l: { u: 5 } }
					}, 8],
					w: { h: 1 }
				},
				f: [{
					u: 0,
					y: 21
				}, 29],
				g: [{
					e: {
						r: 3,
						t: 23
					},
					i: {
						c: 23,
						n: [{ g: 3 }, 0],
						s: 19,
						t: 19
					},
					l: 29,
					o: { n: 0 },
					u: 23
				}, 9],
				h: [{
					".": 18,
					a: { l: 18 }
				}, 1],
				i: {
					a: [{
						b: 0,
						g: 1,
						l: { ".": 23 }
					}, 3],
					b: [{ a: 11 }, 21],
					c: {
						a: { s: 5 },
						e: 21,
						i: [{
							d: 32,
							e: 1
						}, 18],
						o: 21
					},
					d: { e: { r: 5 } },
					e: {
						n: {
							c: 3,
							t: 3
						},
						r: 2,
						t: 4
					},
					g: {
						a: { n: 5 },
						i: 32
					},
					l: { i: { z: 11 } },
					m: {
						a: { n: 32 },
						i: 5,
						o: 27,
						p: { e: 0 }
					},
					n: {
						a: [{ ".": 32 }, 24],
						d: 0,
						e: 0,
						g: 0
					},
					o: 2,
					p: {
						h: [{ e: 6 }, 32],
						l: [{ i: { c: 5 } }, 9]
					},
					q: 21,
					s: [{
						".": 21,
						c: 0,
						h: 23,
						p: 0
					}, 24],
					t: {
						a: { b: 116 },
						e: {
							d: { ".": 19 },
							r: {
								".": 5,
								s: 5
							}
						},
						i: { c: 11 },
						u: [{ r: 5 }, 9]
					},
					v: {
						e: {
							l: 5,
							t: 11
						},
						i: 11,
						o: { l: 287 }
					}
				},
				j: 23,
				k: {
					e: { t: 23 },
					l: {
						e: 1,
						i: { n: 1 }
					},
					".": 288,
					h: { o: 2 },
					r: { a: { u: 29 } },
					s: { ".": 288 }
				},
				l: [{
					e: [{
						d: 24,
						q: { u: 30 }
					}, 0],
					i: {
						g: 21,
						s: [{ h: 4 }, 21]
					},
					o: 73
				}, 29],
				m: [{
					a: { c: 5 },
					e: [{
						n: 23,
						r: { s: 4 }
					}, 24],
					i: {
						n: { g: [{ ".": 21 }, 3] },
						o: 21,
						t: 23
					},
					y: 21
				}, 29],
				n: {
					a: { r: 21 },
					e: {
						l: 23,
						r: 21,
						t: 19,
						y: 23
					},
					i: {
						c: 19,
						s: 92,
						t: 23,
						v: 23
					},
					o: [{ u: 21 }, 0],
					u: 23
				},
				o: {
					b: {
						l: 11,
						o: { t: 289 }
					},
					c: [{ r: 3 }, 24],
					e: [{
						l: { a: { s: 167 } },
						p: { i: { d: { e: 290 } } }
					}, 1],
					f: {
						e: 2,
						i: { l: 4 }
					},
					k: [{ e: { r: 4 } }, 8],
					l: { e: { ".": 32 } },
					m: {
						e: {
							t: { e: 5 },
							s: { h: 3 }
						},
						i: 0,
						p: 0
					},
					n: {
						a: { l: 0 },
						e: 0,
						i: { s: 134 },
						t: { a: 0 }
					},
					o: {
						m: 41,
						t: 32
					},
					p: {
						e: { l: 3 },
						i: { c: 11 }
					},
					r: {
						i: 11,
						o: 4
					},
					s: {
						p: { e: { r: 5 } },
						s: 0
					},
					t: {
						h: { e: 1 },
						y: 1,
						r: { o: { n: 2 } }
					},
					v: {
						a: 1,
						e: { l: 5 }
					},
					x: 5
				},
				p: [{
					e: {
						a: 21,
						n: { t: 19 },
						r: { ".": 4 },
						t: 23
					},
					h: 95,
					i: { n: { g: 3 } },
					o: 23,
					a: { u: { l: { i: 291 } } }
				}, 29],
				r: [{
					e: {
						c: 0,
						f: 0,
						o: 21,
						s: { t: 0 }
					},
					i: {
						o: 0,
						v: 0
					},
					o: {
						n: 17,
						s: 17
					},
					y: { s: 17 }
				}, 72],
				s: [{
					a: [{ t: { i: 5 } }, 29],
					c: 1,
					e: [{
						c: [{ r: 0 }, 23],
						r: {
							".": 4,
							a: { d: { i: 238 } }
						},
						s: 3,
						v: 148
					}, 24],
					h: [{ a: 19 }, 29],
					i: [{ b: 90 }, 29],
					o: { n: 12 },
					p: 29,
					w: 19
				}, 44],
				t: {
					a: {
						c: { h: 36 },
						g: 21
					},
					e: {
						b: 23,
						n: { d: 17 },
						o: 5
					},
					i: [{
						b: 4,
						d: 0,
						e: { r: 21 },
						g: 23,
						l: {
							i: 12,
							l: 17,
							y: 21
						},
						s: { t: 21 },
						v: 21
					}, 29],
					r: {
						i: 23,
						o: { p: { h: 115 } },
						e: { u: 29 }
					},
					s: { h: 1 },
					h: { o: { u: 29 } }
				},
				u: {
					a: 3,
					e: {
						l: 93,
						n: 3
					},
					g: { l: 1 },
					i: { n: 3 },
					m: { p: { l: 11 } },
					n: [{
						k: 6,
						t: { y: 0 }
					}, 9],
					s: { c: 19 },
					t: { i: { n: 6 } }
				},
				v: {
					e: [{
						l: { i: 17 },
						n: 23,
						r: { ".": 4 },
						s: { t: 19 },
						y: 23,
						i: { l: 29 }
					}, 1],
					i: {
						c: 23,
						v: 0
					},
					o: 23
				},
				w: 29,
				y: {
					c: 1,
					n: { g: { e: 32 } },
					t: 3
				},
				z: { s: { c: 2 } }
			},
			s: {
				a: [{
					b: 42,
					c: {
						k: 32,
						r: { i: 11 },
						t: 23
					},
					i: 32,
					l: {
						a: { r: 36 },
						m: 0,
						o: 4,
						t: 0,
						e: { s: {
							c: 54,
							w: 7
						} }
					},
					n: {
						c: 27,
						d: { e: 0 }
					},
					p: [{ a: { r: { i: { l: 292 } } } }, 29],
					t: {
						a: 4,
						i: { o: 76 },
						u: 11
					},
					u: 0,
					v: { o: { r: 4 } },
					w: 32
				}, 9],
				b: 56,
				c: {
					a: {
						n: { t: 149 },
						p: [{ e: { r: 267 } }, 0],
						v: 6,
						t: { o: { l: 208 } }
					},
					e: {
						d: 21,
						i: 18,
						s: 21
					},
					h: [{
						o: 21,
						i: { t: { z: 21 } },
						r: { o: { d: { i: { n: { g: 293 } } } } }
					}, 8],
					i: {
						e: 68,
						n: { d: 150 },
						u: { t: { t: 294 } }
					},
					l: {
						e: 6,
						i: 21
					},
					o: {
						f: 17,
						p: { y: 18 },
						u: { r: { a: 7 } }
					},
					u: 29,
					r: { a: { p: { e: { r: { ".": 36 } } } } },
					y: { t: { h: 247 } }
				},
				d: 56,
				e: {
					".": 18,
					a: [{
						s: 17,
						w: 5
					}, 1],
					c: {
						o: 151,
						t: 27
					},
					d: [{
						e: 95,
						l: 19
					}, 125],
					g: [{ r: 11 }, 9],
					i: 32,
					l: {
						e: 2,
						f: 32,
						v: 32
					},
					m: {
						e: [{ s: { t: 295 } }, 18],
						o: { l: 1 },
						a: { p: { h: 287 } },
						i: { t: { i: { c: 296 } } }
					},
					n: {
						a: { t: 5 },
						c: 18,
						d: 0,
						e: { d: 19 },
						g: 5,
						i: { n: 19 },
						t: {
							d: 18,
							l: 18
						}
					},
					p: {
						a: 152,
						t: { e: { m: { b: 11 } } }
					},
					r: {
						".": 43,
						l: 21,
						o: 0,
						v: { o: 18 }
					},
					s: [{
						h: 4,
						t: 5
					}, 72],
					u: { m: 113 },
					v: [{ e: { n: 11 } }, 32],
					w: { i: 0 },
					x: 32
				},
				f: 47,
				g: 48,
				h: [{
					".": 25,
					e: {
						r: 2,
						v: 32
					},
					i: {
						n: 2,
						o: 3,
						p: 27,
						v: 6
					},
					o: [{
						l: { d: 4 },
						n: 12,
						r: [{ t: 7 }, 17],
						e: { s: { t: 137 } }
					}, 0],
					w: 18
				}, 24],
				i: {
					b: 2,
					c: { c: 19 },
					d: {
						e: {
							".": 27,
							s: [{
								t: 6,
								w: 6
							}, 32],
							d: { ".": 8 }
						},
						i: [{ z: 4 }, 32]
					},
					g: { n: { a: 18 } },
					l: {
						e: 0,
						y: 18
					},
					n: [{
						a: 24,
						e: { ".": 32 },
						g: 23
					}, 42],
					o: [{ n: [{ a: 6 }, 32] }, 41],
					r: [{
						a: 5,
						e: { s: { i: { d: 4 } } }
					}, 9],
					s: 41,
					t: { i: { o: 27 } },
					u: 32,
					v: 41,
					z: 32
				},
				k: [{
					e: [{ t: 23 }, 18],
					i: { n: {
						e: 4,
						g: 4
					} },
					y: { s: { c: 15 } }
				}, 9],
				l: [{
					a: { t: 23 },
					e: 24,
					i: { t: { h: 7 } },
					o: { v: { a: { k: { i: { a: 297 } } } } }
				}, 74],
				m: [{
					a: [{
						l: { l: 54 },
						n: 12
					}, 23],
					e: {
						l: 17,
						n: 19
					},
					i: { t: { h: 32 } },
					o: { l: { d: 49 } }
				}, 42],
				n: 72,
				o: [{
					c: { e: 1 },
					f: { t: 12 },
					l: {
						a: { b: 1 },
						d: 153,
						i: { c: 3 },
						v: 32,
						u: { t: { e: 9 } }
					},
					m: 27,
					n: {
						".": 68,
						a: 17,
						g: 0
					},
					p: [{ h: {
						i: {
							c: 32,
							z: 19
						},
						y: 19
					} }, 21],
					r: {
						c: 5,
						d: 5
					},
					v: [{ i: 4 }, 18],
					g: { a: { m: { y: 298 } } }
				}, 41],
				p: {
					a: [{
						i: 32,
						n: 0,
						c: {
							e: 299,
							i: { n: 69 }
						}
					}, 25],
					e: {
						n: { d: 17 },
						o: 57,
						r: 25,
						c: { i: { o: 11 } }
					},
					h: {
						e: [{ r: [{ o: 213 }, 27] }, 24],
						o: 6
					},
					i: {
						l: 17,
						n: { g: 4 },
						o: 18,
						c: { i: { l: 208 } }
					},
					l: { y: 21 },
					o: {
						n: 21,
						r: [{ t: { s: {
							c: 300,
							w: 300
						} } }, 17],
						t: 18,
						k: { e: { s: { w: 10 } } }
					}
				},
				q: { u: {
					a: { l: { l: 36 } },
					i: { t: { o: 88 } }
				} },
				r: 29,
				s: [{
					a: [{
						s: 12,
						c: { h: { u: 301 } }
					}, 29],
					c: 94,
					e: {
						l: 23,
						n: { g: 19 },
						s: { ".": 21 },
						t: 19
					},
					i: [{
						e: [{ r: 0 }, 21],
						l: { y: 4 },
						a: { n: { ".": 210 } },
						g: { n: { a: { b: 302 } } }
					}, 29],
					l: [{ i: 1 }, 21],
					n: 21,
					p: { e: { n: { d: 115 } } },
					t: 9,
					u: { r: { a: 6 } },
					w: 4,
					h: { a: { t: 3 } }
				}, 25],
				t: {
					".": 25,
					a: {
						g: 24,
						l: 24,
						m: {
							i: 17,
							p: 69
						},
						n: {
							d: 32,
							t: { s: { h: { i: 303 } } }
						},
						p: 90,
						t: {
							".": 32,
							i: 15
						},
						r: { t: { l: { i: 12 } } }
					},
					e: {
						d: 21,
						r: {
							n: { i: 7 },
							o: 19
						},
						w: [{ a: 6 }, 8]
					},
					h: { e: 23 },
					i: [{
						".": 21,
						a: 19,
						c: [{ k: 32 }, 29],
						e: 21,
						f: 23,
						n: { g: 3 },
						r: 32
					}, 9],
					l: { e: 29 },
					o: {
						c: { k: 32 },
						m: { a: 12 },
						n: { e: 32 },
						p: 21,
						r: {
							e: 27,
							a: { b: 304 }
						}
					},
					r: [{
						a: {
							d: 21,
							t: {
								u: 32,
								a: { g: 305 }
							},
							y: 21
						},
						i: {
							d: 21,
							b: { u: { t: 7 } }
						},
						y: 18
					}, 1],
					w: 61,
					y: [{ l: { i: { s: 137 } } }, 24],
					b: 4,
					s: { c: { r: 4 } },
					u: { p: { i: { d: 306 } } }
				},
				u: [{
					a: { l: 2 },
					b: 111,
					g: 151,
					i: {
						s: 4,
						t: 12
					},
					l: 21,
					m: [{ i: 11 }, 9],
					n: 9,
					r: 9,
					p: { e: { r: { e: 307 } } }
				}, 41],
				v: 18,
				w: [{
					o: 18,
					i: { m: { m: 177 } }
				}, 9],
				y: [{
					c: 18,
					l: 27,
					n: {
						o: 5,
						c: 41
					},
					r: { i: { n: 4 } },
					t: { h: { i: 308 } }
				}, 21]
			},
			t: {
				a: [{
					".": 27,
					b: [{
						l: { e: { s: 4 } },
						o: { l: { i: {
							z: 32,
							s: { m: 309 }
						} } }
					}, 25],
					c: { i: 18 },
					d: { o: 4 },
					f: 46,
					i: { l: { o: 5 } },
					l: [{
						a: 4,
						e: { n: 5 },
						i: 11,
						k: [{ a: 204 }, 18],
						l: { i: { s: 0 } },
						o: { g: 4 }
					}, 9],
					m: {
						o: 4,
						i: { n: 82 }
					},
					n: {
						d: { e: 0 },
						t: { a: 54 }
					},
					p: {
						e: { r: 4 },
						l: 4,
						a: { t: { h: 310 } }
					},
					r: {
						a: 0,
						c: 18,
						e: 18,
						i: { z: 3 },
						r: { h: 311 }
					},
					s: {
						e: 0,
						y: 4
					},
					t: {
						i: { c: 18 },
						u: { r: 1 }
					},
					u: { n: 17 },
					v: 0,
					w: 25,
					x: { i: { s: 0 } },
					g: { o: { n: { ".": 3 } } }
				}, 41],
				b: 42,
				c: [{
					h: [{
						e: { t: 5 },
						c: 15,
						i: { e: { r: 237 } }
					}, 21],
					r: 29
				}, 18],
				d: 43,
				e: {
					".": 18,
					a: {
						d: { i: 17 },
						t: 18,
						c: { h: { e: { r: { ".": 36 } } } }
					},
					c: {
						e: 17,
						t: 32
					},
					d: [{ i: 4 }, 42],
					e: 41,
					g: [{
						e: { r: 4 },
						i: 4
					}, 0],
					l: {
						".": 27,
						i: 17,
						s: 32,
						e: {
							g: 84,
							r: { o: 249 }
						}
					},
					m: { a: [{ t: 11 }, 154] },
					n: {
						a: { n: 27 },
						c: 27,
						d: 27,
						e: { s: 18 },
						t: [{ a: { g: 0 } }, 41]
					},
					o: 41,
					p: [{ e: 4 }, 1],
					r: {
						c: 11,
						d: 155,
						i: [{
							e: { s: 5 },
							s: 11,
							z: { a: 6 },
							c: { ".": 8 }
						}, 41],
						n: { i: { t: 32 } },
						v: 5,
						g: { e: { i: 312 } }
					},
					s: {
						".": 18,
						s: [{
							".": 23,
							e: { s: 313 }
						}, 18]
					},
					t: { h: { e: 6 } },
					u: 27,
					x: 27,
					y: 18
				},
				f: 42,
				g: 43,
				h: {
					".": 25,
					a: {
						n: 17,
						l: { a: { m: 228 } }
					},
					e: [{
						a: [{
							s: 3,
							t: 5
						}, 18],
						i: { s: 11 },
						t: 27
					}, 9],
					i: {
						c: {
							".": 4,
							a: 4
						},
						l: 18,
						n: { k: 32 }
					},
					l: 18,
					o: {
						d: {
							e: 4,
							i: { c: 32 },
							o: { n: 11 }
						},
						o: 18,
						r: { i: {
							t: 6,
							z: 5
						} },
						g: { e: { n: { i: 314 } } },
						k: { e: { r: 175 } }
					},
					s: 25,
					y: {
						l: { a: { n: 228 } },
						s: { c: 11 }
					}
				},
				i: {
					a: [{
						b: 1,
						t: { o: 1 },
						n: { ".": 70 }
					}, 41],
					b: 156,
					c: {
						k: 18,
						o: 21,
						u: 157
					},
					d: { i: 32 },
					e: { n: 27 },
					f: [{ y: 4 }, 8],
					g: [{ u: 32 }, 25],
					l: { l: { i: { n: 6 } } },
					m: [{
						p: 18,
						u: { l: 5 }
					}, 41],
					n: [{
						a: 24,
						e: { ".": 27 },
						i: 27,
						o: { m: 285 }
					}, 42],
					o: [{
						c: 4,
						n: { e: { e: 6 } }
					}, 41],
					q: 32,
					s: {
						a: 3,
						e: 27,
						m: 0,
						o: 4,
						p: 0,
						t: { i: { c: { a: 32 } } }
					},
					t: { l: 3 },
					u: 1,
					v: [{ a: 0 }, 41],
					z: [{
						a: 3,
						e: { n: 3 }
					}, 41]
				},
				l: [{
					a: [{ n: 17 }, 19],
					e: {
						".": 27,
						d: 27,
						s: { ".": 27 },
						t: { ".": 19 }
					},
					o: 19,
					i: { e: { r: 315 } }
				}, 25],
				m: [{ e: 0 }, 43],
				n: 81,
				o: [{
					b: 3,
					c: { r: { a: { t: 4 } } },
					d: { o: 18 },
					f: 25,
					g: { r: 9 },
					i: { c: 4 },
					m: {
						a: 9,
						b: 0,
						y: 3
					},
					n: {
						a: {
							l: { i: 0 },
							t: 3
						},
						o: 18,
						y: 18
					},
					r: {
						a: 9,
						i: {
							e: 3,
							z: 5
						}
					},
					s: 8,
					u: {
						r: 32,
						t: 18
					},
					w: { a: { r: 3 } },
					l: { o: { g: { y: 84 } } },
					t: { i: { c: 11 } }
				}, 41],
				p: 43,
				r: {
					a: [{
						b: 11,
						c: {
							h: 5,
							i: [{ t: 17 }, 36],
							t: { e: 17 }
						},
						s: 17,
						v: { e: {
							n: 5,
							s: 158,
							r: { s: [{ a: { b: 317 } }, 15] }
						} },
						i: { t: { o: { r: 316 } } }
					}, 41],
					e: {
						f: 5,
						m: [{ i: 6 }, 0],
						a: { c: { h: { e: 318 } } }
					},
					i: {
						a: [{ l: { ".": 1 } }, 32],
						c: {
							e: { s: 5 },
							i: { a: 32 },
							s: 18
						},
						m: 25,
						v: 0
					},
					o: {
						m: { i: 5 },
						n: {
							i: 6,
							y: 18
						},
						p: {
							h: { e: 5 },
							i: { s: 175 },
							o: { l: {
								e: { s: 320 },
								i: {
									s: 320,
									t: 321
								}
							} }
						},
						s: { p: 11 },
						v: 11,
						l: { e: { u: { m: 319 } } },
						f: { i: {
							c: { ".": 17 },
							t: 11
						} }
					},
					u: {
						i: 5,
						s: 17
					}
				},
				s: [{
					c: [{ h: { i: { e: 12 } } }, 21],
					h: 0,
					w: 21
				}, 101],
				t: [{
					e: { s: 21 },
					o: 19,
					u: 0,
					r: { i: { b: { u: { t: 322 } } } }
				}, 66],
				u: [{
					a: [{ r: 3 }, 2],
					b: { i: 1 },
					d: 8,
					e: 18,
					f: 46,
					i: 76,
					m: 27,
					n: { i: { s: 1 } },
					p: { ".": 48 },
					r: {
						e: 27,
						i: [{ s: 11 }, 32],
						o: 5,
						y: 4,
						n: { a: { r: 12 } }
					},
					s: 27
				}, 41],
				v: 18,
				w: [{
					a: 43,
					i: { s: 17 },
					o: 18,
					h: 29
				}, 1],
				y: [{
					a: 18,
					l: 25,
					p: {
						e: 12,
						h: 4,
						a: { l: 64 }
					}
				}, 41],
				z: [{ e: 1 }, 18]
			},
			u: {
				a: {
					b: 18,
					c: 0,
					n: {
						a: 4,
						i: 0
					},
					r: {
						a: { n: { t: 5 } },
						d: 8,
						i: 11,
						t: 11
					},
					t: 29,
					v: 0,
					d: { r: { a: { t: {
						i: 3,
						u: 15
					} } } }
				},
				b: {
					e: [{
						l: 21,
						r: [{ o: 21 }, 23]
					}, 1],
					i: [{ n: { g: 33 } }, 72],
					l: { e: { ".": 23 } }
				},
				c: {
					a: 23,
					i: {
						b: 0,
						t: 1
					},
					l: { e: 12 },
					r: 23,
					u: 23,
					y: 21
				},
				d: {
					d: 4,
					e: {
						r: 3,
						s: { t: 4 },
						v: 17
					},
					i: {
						c: 29,
						e: {
							d: 3,
							s: 3
						},
						s: 4,
						t: 19
					},
					o: { n: [{ y: 232 }, 21] },
					s: { i: 1 },
					u: 21
				},
				e: {
					n: {
						e: 21,
						s: 17,
						t: { e: 0 }
					},
					r: { i: { l: 0 } },
					a: { m: 15 }
				},
				f: {
					a: 27,
					l: 23
				},
				g: {
					h: { e: { n: 11 } },
					i: { n: 4 }
				},
				i: [{
					l: { i: { z: 5 } },
					n: [{ g: 29 }, 1],
					r: { m: 0 },
					t: { a: 17 },
					v: [{ e: { r: { ".": 0 } } }, 11]
				}, 156],
				j: 19,
				k: 18,
				l: {
					a: [{
						b: 5,
						t: { i: 19 }
					}, 29],
					c: { h: [{ e: 32 }, 17] },
					d: { e: { r: 3 } },
					e: [{ n: 29 }, 1],
					g: { i: 1 },
					i: [{
						a: 19,
						n: { g: 3 },
						s: { h: 4 }
					}, 9],
					l: {
						a: { r: 1 },
						i: {
							b: 96,
							s: 1
						}
					},
					m: 61,
					o: 72,
					s: [{ e: { s: 5 } }, 18],
					t: {
						i: 2,
						r: { a: 54 },
						u: 18
					},
					u: [{ l: 4 }, 23],
					v: 4
				},
				m: {
					a: { b: 4 },
					b: {
						i: 1,
						l: { y: 1 }
					},
					i: [{ n: { g: 83 } }, 29],
					o: { r: { o: 6 } },
					p: 9
				},
				n: {
					a: { t: 17 },
					e: [{ r: 1 }, 24],
					i: [{
						m: 1,
						n: 24,
						s: { h: 4 },
						v: 11
					}, 29],
					s: [{ w: 1 }, 93],
					t: {
						a: { b: 11 },
						e: {
							r: { ".": 1 },
							s: 1
						}
					},
					u: 0,
					y: 4,
					z: 4
				},
				o: {
					r: { s: 21 },
					s: 19,
					u: 29
				},
				p: {
					e: [{ r: { s: 6 } }, 29],
					i: {
						a: 19,
						n: { g: 3 }
					},
					l: 23,
					p: [{ o: { r: { t: 10 } } }, 3],
					t: {
						i: { b: 5 },
						u: 17
					}
				},
				r: {
					a: [{
						".": 18,
						g: 21,
						s: 21,
						l: { ".": 216 }
					}, 29],
					b: { e: 1 },
					c: 0,
					d: 2,
					e: { a: { t: 5 } },
					f: {
						e: { r: 1 },
						r: 1
					},
					i: {
						f: [{ i: { c: 0 } }, 23],
						n: 2,
						o: 23,
						t: 29,
						z: 3,
						a: { l: { ".": 0 } }
					},
					l: [{ i: { n: { g: { ".": 5 } } } }, 9],
					n: { o: 1 },
					o: { s: 17 },
					p: {
						e: 1,
						i: 1
					},
					s: { e: { r: 5 } },
					t: {
						e: { s: 4 },
						h: { e: 3 },
						i: [{ e: 1 }, 17]
					},
					u: 23
				},
				s: [{
					a: {
						d: 19,
						n: 19,
						p: 1
					},
					c: [{ i: 3 }, 8],
					e: {
						a: 5,
						r: { ".": 9 }
					},
					i: {
						a: 19,
						c: 23
					},
					l: { i: { n: 1 } },
					p: 2,
					s: { l: 4 },
					t: {
						e: { r: { e: 4 } },
						r: 2
					},
					u: [{ r: 17 }, 24]
				}, 25],
				t: {
					a: {
						b: 0,
						t: 23
					},
					e: {
						".": 18,
						l: 18,
						n: [{ i: 17 }, 18]
					},
					i: [{
						l: { i: { z: 5 } },
						n: {
							e: 23,
							g: 3
						},
						o: { n: { a: 7 } },
						s: 21,
						z: 31
					}, 101],
					l: 34,
					o: {
						f: 4,
						g: 5,
						m: { a: { t: { i: { c: 5 } } } },
						n: 19,
						u: 21
					},
					s: 0
				},
				u: [{ m: 1 }, 23],
				v: 74,
				x: { u: 11 },
				z: { e: 1 }
			},
			v: {
				a: [{
					".": 32,
					b: 159,
					c: {
						i: { l: 5 },
						u: 11
					},
					g: [{
						e: 1,
						u: { e: { r: 170 } }
					}, 0],
					l: {
						i: { e: 4 },
						o: 5,
						u: 15
					},
					m: { o: 4 },
					n: { i: { z: 4 } },
					p: { i: 4 },
					r: { i: { e: { d: 5 } } },
					t: [{ i: { v: 29 } }, 27],
					u: { d: { e: { v: 54 } } }
				}, 41],
				e: {
					".": 18,
					d: 18,
					g: 11,
					l: {
						".": 23,
						l: { i: 11 },
						o: 1,
						y: 21
					},
					n: {
						o: { m: 11 },
						u: { e: 19 }
					},
					r: {
						d: 21,
						e: {
							".": 32,
							l: [{ y: { ".": 41 } }, 21],
							n: [{ c: 5 }, 23],
							s: 21,
							i: { g: 324 }
						},
						i: { e: 11 },
						m: { i: { n: 36 } },
						s: { e: 27 },
						t: { h: 11 }
					},
					s: [{
						".": 18,
						t: {
							e: 0,
							i: { t: { e: 15 } }
						}
					}, 99],
					t: {
						e: [{ r: 11 }, 1],
						y: 1
					}
				},
				i: {
					a: {
						l: { i: 4 },
						n: 32
					},
					d: {
						e: {
							".": 32,
							d: 32,
							n: 47,
							s: 32
						},
						i: 32
					},
					f: 23,
					g: { n: 4 },
					k: 0,
					l: [{ i: {
						t: 32,
						z: 127
					} }, 25],
					n: [{
						a: 26,
						c: 24,
						d: 5,
						g: 18
					}, 29],
					o: {
						l: 11,
						r: 73,
						u: 2
					},
					p: 1,
					r: { o: 4 },
					s: {
						i: { t: 11 },
						o: 3,
						u: 3
					},
					t: {
						i: 18,
						r: 11,
						y: 18
					},
					v: [{ i: { p: { a: { r: 325 } } } }, 27]
				},
				o: {
					".": 32,
					i: [{
						r: { d: { u: 323 } },
						c: { e: { p: 213 } }
					}, 0],
					k: 27,
					l: {
						a: 1,
						e: 19,
						t: 32,
						v: 27
					},
					m: { i: 5 },
					r: {
						a: { b: 5 },
						i: 17,
						y: 1
					},
					t: {
						a: 1,
						e: { e: 18 }
					}
				},
				v: 26,
				y: 21
			},
			w: {
				a: {
					b: { l: 19 },
					c: 25,
					g: {
						e: { r: 4 },
						o: 5
					},
					i: { t: 6 },
					l: { ".": 19 },
					m: 0,
					r: { t: 0 },
					s: { t: [{ e: { w: { a: 326 } } }, 0] },
					t: { e: 2 },
					v: { e: {
						r: 4,
						g: 327
					} }
				},
				b: 29,
				e: {
					a: {
						r: { i: { e: 5 } },
						t: { h: 54 }
					},
					d: { n: 0 },
					e: {
						t: 12,
						v: 5,
						k: { n: 137 }
					},
					l: { l: 0 },
					r: 29,
					s: { t: 12 },
					v: 23
				},
				h: { i: 0 },
				i: [{
					l: [{ l: { i: { n: 6 } } }, 8],
					n: {
						d: { e: 0 },
						g: 0
					},
					r: 0,
					s: { e: 27 },
					t: { h: 12 },
					z: 5,
					d: { e: { s: { p: 6 } } }
				}, 9],
				k: 21,
				l: {
					e: { s: 1 },
					i: { n: 3 }
				},
				n: { o: 21 },
				o: [{
					m: 15,
					v: { e: { n: 4 } },
					k: { e: { n: 85 } }
				}, 160],
				p: 19,
				r: {
					a: [{ p: { a: { r: { o: 12 } } } }, 0],
					i: [{ t: {
						a: 36,
						e: { r: { ".": 183 } }
					} }, 0]
				},
				s: {
					h: 23,
					l: 1,
					p: { e: 1 },
					t: 60
				},
				t: 18,
				y: 1,
				c: 23
			},
			x: {
				a: [{
					c: { e: 5 },
					g: { o: 21 },
					m: 11,
					p: 21,
					s: 5
				}, 29],
				c: 161,
				e: [{
					c: { u: { t: { o: 1 } } },
					d: 24,
					r: {
						i: 0,
						o: 4
					}
				}, 29],
				h: [{
					i: [{ l: 6 }, 8],
					u: 0
				}, 29],
				i: [{
					a: 4,
					c: 4,
					d: { i: 4 },
					m: {
						e: 21,
						i: { z: 4 }
					}
				}, 23],
				o: [{ b: 21 }, 23],
				p: [{
					a: { n: { d: 17 } },
					e: {
						c: { t: { o: 10 } },
						d: 11
					}
				}, 23],
				t: [{ i: 23 }, 74],
				u: [{ a: 3 }, 29],
				x: 1,
				q: [{ u: { i: { s: 54 } } }, 29]
			},
			y: {
				a: {
					c: 19,
					r: 110,
					t: 19
				},
				b: 29,
				c: [{
					e: [{ r: 4 }, 24],
					h: [{ e: [{ d: 264 }, 0] }, 23],
					o: {
						m: 17,
						t: 17
					}
				}, 29],
				d: 29,
				e: {
					e: 19,
					r: [{ f: 21 }, 29],
					s: [{ t: { e: { r: { y: 328 } } } }, 0],
					t: 1
				},
				g: { i: 19 },
				h: 47,
				i: 29,
				l: {
					a: 23,
					l: { a: { b: { l: 6 } } },
					o: 23,
					u: 19
				},
				m: {
					b: { o: { l: 7 } },
					e: [{ t: { r: { y: 20 } } }, 0],
					p: { a: 12 }
				},
				n: {
					c: { h: { r: 3 } },
					d: 4,
					g: 4,
					i: { c: 4 },
					x: 32
				},
				o: [{
					d: 4,
					g: 33,
					m: 0,
					n: {
						e: { t: 4 },
						s: 21
					},
					s: 21
				}, 72],
				p: {
					e: {
						d: 21,
						r: 6
					},
					i: 3,
					o: [{ c: 21 }, 23],
					t: { a: 9 },
					u: 19
				},
				r: {
					a: { m: 5 },
					i: { a: 4 },
					o: 23,
					r: 1
				},
				s: {
					c: 1,
					e: 161,
					i: {
						c: { a: 3 },
						o: 3,
						s: 27
					},
					o: 21,
					s: 0,
					t: [{
						a: 3,
						r: { o: 29 }
					}, 2],
					u: { r: 17 }
				},
				t: {
					h: { i: { n: 23 } },
					i: { c: 3 }
				},
				w: 29
			},
			z: {
				a: [{
					b: 79,
					r: 8
				}, 2],
				b: 18,
				e: [{
					n: 1,
					p: 1,
					r: [{ o: 3 }, 29],
					t: 0
				}, 25],
				i: [{
					l: 21,
					s: 21,
					a: { n: { ".": 23 } }
				}, 42],
				l: 32,
				m: 18,
				o: [{
					m: 1,
					o: { l: 4 },
					p: { h: { r: 329 } }
				}, 41],
				t: { e: 0 },
				z: [{
					y: 21,
					w: 231
				}, 101]
			}
		},
		{
			associate: [2, 5],
			associates: [2, 5],
			declination: [
				3,
				6,
				9
			],
			obligatory: [5, 7],
			philanthropic: [4, 7],
			present: [],
			presents: [],
			project: [],
			projects: [],
			reciprocity: [4],
			recognizance: [
				2,
				6,
				9
			],
			reformation: [
				3,
				6,
				9
			],
			retribution: [
				3,
				6,
				9
			],
			table: [2]
		}
	]);
})), jo = xo((/* @__PURE__ */ l((/* @__PURE__ */ o(((e, t) => {
	t.exports = ko()(Ao());
})))(), 1)).default), Mo = "18px \"Source Serif 4\"", No = 648, Po = 9, Fo = 30, Io = class {
	scroller;
	settings;
	column;
	prepared = null;
	par = null;
	width = 0;
	rendered = /* @__PURE__ */ new Map();
	frame = 0;
	observer = new ResizeObserver(() => this.relayout());
	abort = new AbortController();
	constructor(e, t) {
		this.scroller = e, this.settings = t, this.column = document.createElement("div"), this.column.className = "pv-text", e.addEventListener("scroll", () => this.schedule(), {
			passive: !0,
			signal: this.abort.signal
		}), this.observer.observe(e);
	}
	destroy() {
		this.clear(), this.observer.disconnect(), this.abort.abort();
	}
	clear() {
		this.column.replaceChildren(), this.rendered.clear(), this.prepared = null, this.par = null, this.width = 0;
	}
	show(e, t) {
		this.settings = t, this.scroller.replaceChildren(), this.clear();
		let n = performance.now();
		this.prepared = wo(e, {
			measure: yo(Mo),
			lineHeight: 28,
			hyphenate: jo,
			align: t.align,
			paragraphSpacing: Po
		}), this.scroller.append(this.column), this.scroller.scrollTop = 0, this.relayout();
		let r = performance.now() - n, i = this.par?.lines ?? [];
		return {
			lines: i.length,
			words: e.split(/\s+/).filter(Boolean).length,
			millis: r,
			notOptimal: i.filter((e) => e.quality !== "optimal").length
		};
	}
	relayout() {
		if (!this.prepared) return;
		let e = this.scroller.clientWidth - 32, t = Math.max(120, Math.min(No, Math.floor(e)));
		if (t === this.width && this.par) return;
		let n = this.par?.lines.length ?? 0, r = this.par ? Lo(this.par.lines, this.scroller.scrollTop - this.column.offsetTop) : 0;
		this.width = t, this.par = this.prepared.layout(t), this.column.style.width = `${t}px`, this.column.style.height = `${this.par.height}px`, this.column.classList.toggle("diagnostics", this.settings.diagnostics);
		for (let e of this.rendered.values()) e.remove();
		if (this.rendered.clear(), n > 0) {
			let e = this.par.lines[Math.min(this.par.lines.length - 1, Math.round(r * this.par.lines.length / n))];
			this.scroller.scrollTop = (e?.y ?? 0) + this.column.offsetTop;
		}
		this.paint();
	}
	schedule() {
		this.frame ||= requestAnimationFrame(() => {
			this.frame = 0, this.paint();
		});
	}
	paint() {
		let e = this.par;
		if (!e) return;
		let t = this.scroller.scrollTop - this.column.offsetTop, n = Math.max(0, Lo(e.lines, t) - Fo), r = Math.min(e.lines.length, Lo(e.lines, t + this.scroller.clientHeight) + 1 + Fo);
		for (let [e, t] of this.rendered) (e < n || e >= r) && (t.remove(), this.rendered.delete(e));
		for (let t = n; t < r; t++) {
			if (this.rendered.has(t)) continue;
			let n = e.lines[t], r = Eo(n, { lineHeight: 28 });
			n.quality !== "optimal" && Ro(r, n), this.column.append(r), this.rendered.set(t, r);
		}
	}
};
function Lo(e, t) {
	let n = 0, r = e.length - 1;
	for (; n < r;) {
		let i = n + r + 1 >> 1;
		e[i].y <= t ? n = i : r = i - 1;
	}
	return Math.max(0, n);
}
function Ro(e, t) {
	e.classList.add(`q-${t.quality}`);
	let n = Number.isFinite(t.ratio) ? t.ratio.toFixed(2) : "∞";
	e.dataset.quality = t.quality, e.title = `${t.quality} · adjustment ratio ${n}`;
}
//#endregion
//#region src/metrics.ts
var zo = "600 14px Antonio", Bo = .05 * 14;
function Vo() {
	let e = /* @__PURE__ */ new Map();
	return (t, n, r) => {
		let i = e.get(t);
		if (i && i.text === n) return i.value;
		let a = r();
		return e.set(t, {
			text: n,
			value: a
		}), a;
	};
}
function Ho() {
	let e = yo(zo), t = yo(Mo), n = Vo(), r = (e, r, i) => n(`${i}|${e}`, r, () => wo(r, i === "typeset" ? {
		measure: t,
		lineHeight: 28,
		hyphenate: jo,
		paragraphSpacing: 9
	} : {
		measure: t,
		lineHeight: 28,
		align: "left",
		hyphenate: null,
		paragraphSpacing: 9
	}));
	return {
		key: (t) => e(t.toUpperCase()) + Bo * t.length,
		value: (e) => t(e),
		text: (e, t, n = "typeset") => ({ height: (i) => r(e, t, n).layout(i).height }),
		prepared: r
	};
}
function Uo() {
	let e = Vo();
	return [A({ height: (t, n, r) => e(`${r}|${t}`, n, () => {
		let e = Ja(n);
		Object.assign(e.style, {
			position: "absolute",
			visibility: "hidden",
			left: "-10000px",
			top: "0",
			width: `${r}px`
		}), document.body.append(e);
		let t = e.getBoundingClientRect().height;
		return e.remove(), t;
	}) })];
}
var Wo = { markdown(e, t) {
	let n = e.data;
	t.append(Ja(n.text)), n.scroll && t.classList.add("scroll");
} }, Go = 14;
function Ko(e, t) {
	let n = document.createElement("div");
	n.className = "pv-layout", n.classList.toggle("targeted", t.target !== null), n.style.width = `${e.width}px`, n.style.height = `${e.height}px`;
	let r = null;
	if (e.scroll) {
		let t = e.scroll.rect;
		r = document.createElement("div"), r.className = "pv-scroll", Object.assign(r.style, {
			left: `${t.x}px`,
			top: `${t.y}px`,
			width: `${t.w}px`,
			height: `${t.h}px`
		});
		let n = document.createElement("div");
		Object.assign(n.style, {
			position: "relative",
			height: `${e.scroll.height}px`
		}), r.append(n);
	}
	let i = new Set(e.marks.filter((e) => e.kind === "frame" && e.targetable).map((e) => e.kind === "frame" ? e.slot : "")), a = (e) => t.target === e && i.has(e);
	for (let i of e.marks) {
		let o = Xo(i, t, a);
		if (i.scrolled && r) {
			let t = e.scroll.rect;
			o.style.left = `${i.rect.x - t.x}px`, o.style.top = `${i.rect.y - t.y}px`, r.firstElementChild.append(o);
		} else n.append(o);
	}
	return r && n.append(r), n;
}
function qo(e) {
	for (let t of e.querySelectorAll(".pv-title, .pv-chip b, .pv-key span, .pv-crumb span, .pv-segment span")) if (t.scrollWidth > t.clientWidth + .5) {
		let e = t.closest(".pv-layout > *");
		e.title = t.textContent ?? "";
	}
}
function Jo(e) {
	e && (e.classList.remove("blink"), e.offsetWidth, e.classList.add("blink"), window.setTimeout(() => e.classList.remove("blink"), 900));
}
function Yo(e, t, n) {
	e.classList.add("nav"), e.setAttribute("role", "button"), e.tabIndex = 0;
	let r = () => t.input(n);
	e.addEventListener("click", r), e.addEventListener("keydown", (e) => {
		(e.key === "Enter" || e.key === " ") && (e.preventDefault(), r());
	});
}
function Xo(e, t, n) {
	let r = e.rect;
	if (e.kind === "frame") {
		let i = "http://www.w3.org/2000/svg", a = document.createElementNS(i, "svg"), o = (e.outer ? " outer" : "") + (n(e.slot) ? " target" : "");
		a.setAttribute("class", `pv-frame v-${e.variant} ${Zo(e.type)}${o}`), a.setAttribute("viewBox", `0 0 ${r.w} ${r.h}`), a.dataset.slot = e.slot, Object.assign(a.style, {
			left: `${r.x}px`,
			top: `${r.y}px`,
			width: `${r.w}px`,
			height: `${r.h}px`
		});
		let s = document.createElementNS(i, "path");
		return s.setAttribute("d", k(e.arch, r.w, r.h, e.geom)), s.addEventListener("click", () => t.input({
			on: "border",
			slot: e.slot
		})), a.append(s), a;
	}
	let i = document.createElement("div");
	switch (i.className = e.kind === "text" ? "pv-textblock" : `pv-${e.kind}`, Object.assign(i.style, {
		left: `${r.x}px`,
		top: `${r.y}px`,
		width: `${r.w}px`,
		height: `${r.h}px`
	}), "type" in e && e.kind !== "token" && e.kind !== "tag" && i.classList.add(Zo(e.type)), "slot" in e && (i.dataset.slot = e.slot), e.kind) {
		case "title": return i.style.fontSize = `${14 * e.scale}px`, i.style.lineHeight = `${r.h}px`, i.textContent = e.text, i.classList.add(Zo(e.trail.at(-1).type)), e.outer && i.classList.add("outer"), n(e.slot) && i.classList.add("target"), Yo(i, t, {
			on: "title",
			ptr: e.ptr
		}), i;
		case "key":
		case "crumb":
		case "segment":
			i.innerHTML = "<span></span>", i.firstElementChild.textContent = e.kind === "segment" && e.badge ? `${e.text} ${e.badge}` : e.text;
			break;
		case "chip":
			i.innerHTML = "<b></b><i></i>", i.firstElementChild.textContent = e.text, i.lastElementChild.textContent = e.badge, e.badge || i.lastElementChild.remove();
			break;
		case "token":
		case "tag":
			i.textContent = e.text, i.classList.add(`t-${e.type}`);
			break;
		case "text": {
			let n = t.metrics.prepared(e.ptr, e.text, e.style).layout(e.scroll ? r.w - Go : r.w);
			i.append(Do(n, { lineHeight: 28 })), e.scroll && i.classList.add("scroll"), t.diagnostics && n.quality !== "optimal" && (i.dataset.quality = n.quality, i.title = `${n.quality} line breaking`);
			break;
		}
		case "range":
			i.textContent = e.text, i.classList.add(Zo("array"));
			break;
		case "pager": return i.innerHTML = "<span></span>", i.firstElementChild.textContent = {
			up: "▲",
			down: "▼",
			prev: "◀",
			next: "▶"
		}[e.dir], i.classList.add(Zo(e.type), e.dir === "up" || e.dir === "down" ? "v" : "h"), e.outer && n("") && i.classList.add("target"), Yo(i, t, {
			on: "pager",
			mark: e
		}), i.setAttribute("aria-label", "sibling" in e.set ? e.dir === "prev" ? "Previous element" : "Next element" : {
			up: "Previous segments",
			down: "More segments",
			prev: "Previous page",
			next: "Next page"
		}[e.dir]), e.disabled && (i.classList.add("disabled"), i.tabIndex = -1), i;
		case "custom":
			Wo[e.variant]?.(e, i);
			break;
		case "menu": {
			i.innerHTML = "<button aria-label=\"More breadcrumbs\">☰</button><ul hidden></ul>";
			let n = i.querySelector("ul");
			for (let r of e.items) {
				let i = document.createElement("li");
				i.textContent = r.text, i.className = Zo(r.type), i.addEventListener("click", () => t.input({
					on: "crumb",
					slot: e.slot,
					ptr: r.ptr
				})), n.append(i);
			}
			i.querySelector("button").addEventListener("click", (e) => {
				e.stopPropagation(), n.hidden = !n.hidden;
			});
			break;
		}
	}
	return pe.has(e.kind) && (e.kind === "crumb" ? Yo(i, t, {
		on: "crumb",
		slot: e.slot,
		ptr: e.ptr
	}) : (e.kind === "chip" || e.kind === "segment" || e.kind === "key") && Yo(i, t, {
		on: e.kind,
		ptr: e.ptr
	})), i;
}
function Zo(e) {
	return e === "object" ? "ty-object" : e === "array" ? "ty-array" : "ty-scalar";
}
//#endregion
//#region src/rules.ts
var Qo = () => ({
	spec: {
		views: {},
		expanded: [],
		minified: [],
		windows: {},
		offsets: {}
	},
	target: ""
}), $o = (e, t) => e === t || e.startsWith(`${t}/`), es = (e, t) => e !== t && $o(e, t);
function ts(e, t) {
	return t === "" ? fe(e) : e.views[t] ?? t;
}
function ns(e, t, n) {
	let { target: r } = t;
	switch (e.on) {
		case "border": return rs(e.slot, t, n);
		case "chip":
		case "segment": return r === null ? ds(e.ptr, t, n) : os(e.ptr, t, n);
		case "key":
		case "title": return as(e.ptr, t, n);
		case "crumb": return us(e.slot, e.ptr, t, n);
		case "pager": return hs(e.mark, t, n);
		case "up": return gs(t, n);
	}
}
function rs(e, t, n) {
	return is(t.target === e ? null : e, t, n);
}
function is(e, t, n) {
	return e !== null && !n.plan.marks.some((t) => t.kind === "frame" && t.slot === e && t.targetable) ? { refuse: e } : {
		state: {
			...t,
			target: e
		},
		change: {
			type: "target",
			path: e === null ? null : ts(t.spec, e)
		}
	};
}
function as(e, t, n) {
	return t.target === null ? fs(e, t, n) : os(e, t, n);
}
function os(e, t, n) {
	let r = t.target;
	return r === null || !v(n.tree, e) || !es(e, ts(t.spec, r)) ? { refuse: e } : r === "" ? ls(e, t, n) : cs(r, e, t, n);
}
function ss(e, t, n, r = "") {
	let i = { ...e };
	for (let e = v(t, n); e?.parent && $o(e.parent.ptr, r); e = e.parent) e.parent.kind === "array" && (i[e.parent.ptr] = { start: Number(e.label) });
	return i;
}
function cs(e, t, n, r) {
	let i = { ...n.spec.views };
	t === e ? delete i[e] : i[e] = t;
	let a = ss(n.spec.windows, r.tree, t, e);
	return {
		state: {
			...n,
			spec: {
				...n.spec,
				views: i,
				windows: a
			}
		},
		change: {
			type: "open",
			path: t,
			slot: e
		}
	};
}
function ls(e, t, n) {
	let { spec: r } = t, i = ((t) => Object.fromEntries(Object.entries(t).filter(([t]) => $o(t, e))))(r.views);
	return i[""] = e, {
		state: {
			target: t.target === null || t.target === "" || es(t.target, e) ? t.target : "",
			spec: {
				views: i,
				expanded: r.expanded.filter((t) => $o(t, e)),
				minified: r.minified.filter((t) => $o(t, e)),
				windows: ss(r.windows, n.tree, e),
				offsets: r.offsets
			}
		},
		change: {
			type: "open",
			path: e,
			slot: ""
		}
	};
}
function us(e, t, n, r) {
	return e === "" ? ls(t, n, r) : n.target === e ? cs(e, $o(e, t) ? e : t, n, r) : as(t, n, r);
}
function ds(e, t, n) {
	let { spec: r } = t, i = r.minified.some((t) => $o(e, t));
	if (!v(n.tree, e)) return { refuse: e };
	let a = {
		type: "expand",
		path: e
	}, o = (t) => me(t, e);
	if (r.expanded.includes(e) && !i) return {
		state: t,
		change: a,
		expect: o
	};
	let s = ss(r.windows, n.tree, e);
	return {
		state: {
			...t,
			spec: {
				...r,
				windows: s,
				expanded: r.expanded.includes(e) ? r.expanded : [...r.expanded, e],
				minified: r.minified.filter((t) => !$o(e, t))
			}
		},
		change: a,
		expect: o
	};
}
function fs(e, t, n) {
	let { spec: r } = t;
	return !r.minified.includes(e) && (r.expanded.includes(e) || me(n.plan, e)) ? ps(e, t, n) : ds(e, t, n);
}
function ps(e, t, n) {
	let { spec: r } = t;
	if (!v(n.tree, e) || e === fe(r)) return { refuse: e };
	let i = {
		type: "minify",
		path: e
	}, a = (t) => !me(t, e);
	return r.minified.includes(e) ? {
		state: t,
		change: i,
		expect: a
	} : {
		state: {
			...t,
			spec: {
				...r,
				minified: [...r.minified, e]
			}
		},
		change: i,
		expect: a
	};
}
function ms(e, t, n, r) {
	let i = r.plan.marks.find((n) => n.kind === "pager" && n.ptr === e && n.dir === t);
	return i ? hs(i, n, r) : { refuse: e };
}
function hs(e, t, n) {
	if (e.disabled) return { refuse: e.ptr };
	let { spec: r } = t;
	if ("sibling" in e.set) {
		let { sibling: r, slot: i } = e.set;
		return i === "" ? ls(r, t, n) : cs(i, r, t, n);
	}
	let i = "offset" in e.set ? {
		...r,
		offsets: {
			...r.offsets,
			[e.ptr]: e.set.offset
		}
	} : {
		...r,
		windows: {
			...r.windows,
			[e.ptr]: e.set.window
		}
	};
	return {
		state: {
			...t,
			spec: i
		},
		change: {
			type: "page",
			path: e.ptr
		}
	};
}
function gs(e, t) {
	let n = e.target ?? "", r = ts(e.spec, n), i = v(t.tree, r)?.parent;
	return !i || n !== "" && r === n ? { refuse: r } : n === "" ? ls(i.ptr, e, t) : cs(n, i.ptr, e, t);
}
function _s(e, t) {
	let n = null;
	for (let [r, i] of Object.entries(e.windows)) {
		if (!("end" in i)) continue;
		let a = t.marks.find((e) => e.kind === "range" && e.ptr === r);
		a?.kind === "range" && (n ??= { ...e.windows }, n[r] = { start: a.start });
	}
	return n ? {
		...e,
		windows: n
	} : e;
}
function vs(e, t) {
	let { spec: n } = e, r = (e) => v(t, e), i = (e) => r(e) !== void 0, a = fe(n);
	for (; !i(a);) a = a.slice(0, a.lastIndexOf("/"));
	let o = {};
	for (let [e, t] of Object.entries(n.views)) e !== "" && i(t) && es(t, e) && (r(e)?.children.length ?? 0) > 0 && (o[e] = t);
	a !== "" && (o[""] = a);
	let s = (e) => Object.fromEntries(Object.entries(e).filter(([e]) => i(e)));
	return {
		target: e.target === null || e.target === "" || (r(e.target)?.children.length ?? 0) > 0 ? e.target : "",
		spec: {
			views: o,
			expanded: n.expanded.filter(i),
			minified: n.minified.filter(i),
			windows: s(n.windows),
			offsets: s(n.offsets)
		}
	};
}
//#endregion
//#region src/viewer.ts
var ys = class {
	element;
	options;
	settings;
	metrics = Ho();
	plugins = Uo();
	reading;
	listeners = /* @__PURE__ */ new Map();
	observer = new ResizeObserver(() => this.render());
	abort = new AbortController();
	planner = null;
	current = null;
	now = Qo();
	planned = null;
	drawn = "";
	version = 0;
	constructor(e, t, n = {}) {
		this.element = e, this.options = n, this.settings = {
			diagnostics: n.diagnostics ?? !1,
			align: n.align ?? "justify"
		}, e.classList.add("pocketview"), e.dataset.theme = n.theme ?? "pastel", e.hasAttribute("tabindex") || (e.tabIndex = -1), this.reading = new Io(e, this.settings), e.addEventListener("keydown", (e) => {
			(e.key === "Escape" || e.key === "Backspace") && this.act({ on: "up" });
		}, { signal: this.abort.signal }), this.observer.observe(e), t !== void 0 && bs().then(() => {
			this.current || this.show(t);
		});
	}
	get state() {
		return this.now;
	}
	target(e, t = !1) {
		return this.call((t) => is(e, this.now, t), t);
	}
	open(e, t = !1) {
		return this.call((t) => os(e, this.now, t), t);
	}
	expand(e, t = !1) {
		return this.call((t) => ds(e, this.now, t), t);
	}
	minify(e, t = !1) {
		return this.call((t) => ps(e, this.now, t), t);
	}
	page(e, t, n = !1) {
		return this.call((n) => ms(e, t, this.now, n), n);
	}
	refuse(e = null, t = !1) {
		return Jo(this.element.querySelector(".pv-layout")), t && this.emit({
			type: "refuse",
			path: e
		}), !0;
	}
	update(e, t, n = !1) {
		if (!this.current) return !1;
		if (this.planner) {
			if (!this.planner.update(e, t)) return !1;
			this.current = {
				value: this.planner.tree.value,
				label: this.current.label
			}, this.version++, this.now = vs(this.now, this.planner.tree), this.render();
		} else {
			if (e !== "") return !1;
			this.show(t, this.current.label);
		}
		return n && this.emit({
			type: "update",
			path: e
		}), !0;
	}
	isShown(e) {
		return this.current ? this.planner ? this.planned !== null && me(this.planned.plan, e) : e === "" : !1;
	}
	get value() {
		return this.current?.value;
	}
	show(e, t = this.options.label) {
		if (this.current = {
			value: e,
			label: t
		}, this.now = Qo(), this.planned = null, this.drawn = "", typeof e == "string" && !Ce(e)) return this.planner = null, this.element.classList.add("pv-reading"), {
			view: "text",
			...this.reading.show(e, this.settings)
		};
		this.reading.clear(), this.element.classList.remove("pv-reading"), this.planner = new ge(h(e, t), this.metrics, void 0, this.plugins);
		let n = performance.now();
		return this.render(), {
			view: "layout",
			millis: performance.now() - n
		};
	}
	on(e, t) {
		let n = this.listeners.get(e);
		return n || this.listeners.set(e, n = /* @__PURE__ */ new Set()), n.add(t), () => n.delete(t);
	}
	setTheme(e) {
		this.element.dataset.theme = e;
	}
	configure(e) {
		Object.assign(this.settings, e), !this.planner && this.current && this.reading.show(this.current.value, this.settings), this.drawn = "", this.render();
	}
	destroy() {
		this.observer.disconnect(), this.abort.abort(), this.reading.destroy(), this.listeners.clear(), this.planner = null, this.element.replaceChildren(), this.element.classList.remove("pocketview", "pv-reading");
	}
	act(e) {
		let t = this.run((t) => ns(e, this.now, t));
		t !== null && ("refuse" in t ? this.refuse(t.refuse, !0) : (this.element.focus({ preventScroll: !0 }), this.emit(t.change)));
	}
	call(e, t) {
		let n = this.run(e);
		return n === null || "refuse" in n ? !1 : (t && this.emit(n.change), !0);
	}
	run(e) {
		let t = this.planner, n = this.viewport();
		if (!t || !this.planned || !n) return null;
		let r = e({
			tree: t.tree,
			plan: this.planned.plan
		});
		if ("refuse" in r) return r;
		let { state: i, change: a, expect: o } = r, s = this.keyOf(i.spec, n) === this.planned.key ? this.planned.plan : t.plan(i.spec, n);
		return o && !o(s) ? { refuse: a.path } : (this.commit(i, s, n), r);
	}
	emit(e) {
		let t = {
			...e,
			viewer: this
		};
		for (let n of [e.type, "*"]) for (let e of this.listeners.get(n) ?? []) e(t);
	}
	commit(e, t, n) {
		let r = _s(e.spec, t), i = e.target;
		i !== null && i !== "" && !t.marks.some((e) => e.kind === "frame" && e.slot === i) && (i = ""), this.now = {
			spec: r,
			target: i
		}, this.planned = {
			key: this.keyOf(r, n),
			plan: t
		}, this.draw();
	}
	render() {
		let e = this.viewport();
		if (this.planner && e) {
			if (this.planned?.key === this.keyOf(this.now.spec, e)) return this.draw();
			this.commit(this.now, this.planner.plan(this.now.spec, e), e);
		}
	}
	draw() {
		if (!this.planned) return;
		let e = JSON.stringify([
			this.planned.key,
			this.now.target,
			this.settings.diagnostics
		]);
		if (e === this.drawn && this.element.firstChild) return;
		this.drawn = e;
		let t = Ko(this.planned.plan, {
			target: this.now.target,
			metrics: this.metrics,
			diagnostics: this.settings.diagnostics,
			input: (e) => this.act(e)
		});
		this.element.replaceChildren(t), qo(t);
	}
	keyOf(e, t) {
		return JSON.stringify([
			this.version,
			e,
			t.w,
			t.h
		]);
	}
	viewport() {
		let e = getComputedStyle(this.element), t = (e) => parseFloat(e) || 0, n = Math.floor(this.element.clientWidth - t(e.paddingLeft) - t(e.paddingRight)), r = Math.floor(this.element.clientHeight - t(e.paddingTop) - t(e.paddingBottom));
		return n > 0 && r > 0 ? {
			w: n,
			h: r
		} : null;
	}
};
function bs() {
	return Promise.all([document.fonts.load(Mo), document.fonts.load(zo)]);
}
//#endregion
//#region src/options.ts
var xs = [
	{
		id: "pastel",
		label: "Pastel"
	},
	{
		id: "lux",
		label: "Lux"
	},
	{
		id: "solar-dark",
		label: "Solarized dark"
	},
	{
		id: "solar-light",
		label: "Solarized light"
	}
];
//#endregion
//#region src/index.ts
function Ss(e, t, n) {
	return new ys(e, t, n);
}
//#endregion
export { xs as THEMES, ys as Viewer, bs as fontsReady, Ss as mount };
