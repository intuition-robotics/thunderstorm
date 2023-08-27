
import {deepClone} from "../../main/utils/object-tools";
import {__stringify} from "../../main/utils/tools";

const int = 1;
const str = 'a';
const empOb = {};
const ob = {a: 1};
const o1 = {a: 2, b: undefined};
const o2 = {c: 3, d: null};
const o3 = {a: {b: {c: {d: 1}}}};
const und = undefined;
const nul = null;
const zero = 0;
const nn = NaN;
const empStr = '';

const cl = deepClone(o2);
o2.c = 1;
console.log(o2, cl);

const nestedCl = deepClone(o3);
o3.a.b.c.d = 2;
console.log(__stringify(o3),__stringify(nestedCl));
