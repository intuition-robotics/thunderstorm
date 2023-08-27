

import {merge} from "../../main/utils/merge-tools";

const int = 1;
const str = 'a';
const empOb = {};
const ob = {a: 1};
const o1 = {a: 2, b: undefined, c: 5};
const o2 = {b: 1, c: 3, d: null};
const o3 = {c: 3, d: null};
const und = undefined;
const nul = null;
const zero = 0;
const nn = NaN;
const empStr = '';

// console.log(merge(int,str));
console.log(merge(o1, o2));
console.log(merge(o2, o1));
console.log(merge(o3, o1));
console.log(merge(nul, o1));


const arr = [1, 2];
const arr2 = arr.map(a => a);
arr2.push(3);
console.log(arr, arr2);
