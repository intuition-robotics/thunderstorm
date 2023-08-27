
import {
	compare,
	TestModel,
	TestSuit
} from "../_main";

type CompareTestInput = {
	one: any;
	two: any;
}

type CompareTest = TestModel<CompareTestInput, "pass" | "fail">;

export const testSuit_compare: TestSuit<CompareTest> = {
	key: "compare",
	label: "Compare",
	processor: async (input) => compare(input.one, input.two) ? "pass" : "fail",
	models: [
		{expected: "pass", input: {one: 1, two: 1}},
		{expected: "pass", input: {one: "1", two: "1"}},
		{expected: "fail", input: {one: 1, two: 2}},
		{expected: "fail", input: {one: 2, two: 1}},
		{expected: "fail", input: {one: "1", two: 1}},
		{expected: "fail", input: {one: 1, two: "1"}},
		{expected: "pass", input: {one: "wqer", two: "wqer"}},
		{expected: "fail", input: {one: "wqer1", two: "wqer"}},
		{expected: "fail", input: {one: "wqer", two: "wqer1"}},
		{expected: "pass", input: {one: [], two: []}},
		{expected: "pass", input: {one: ["Adam"], two: ["Adam"]}},
		{expected: "pass", input: {one: ["Adam", "VDK"], two: ["Adam", "VDK"]}},
		{expected: "fail", input: {one: ["Adam"], two: []}},
		{expected: "fail", input: {one: [], two: ["Adam"]}},
		{expected: "fail", input: {one: ["Adam", "VDK"], two: ["Adam"]}},
		{expected: "fail", input: {one: ["Adam"], two: ["Adam", "VDK"]}},
		{expected: "fail", input: {one: ["VDK", "Adam"], two: ["Adam", "VDK"]}},
		{expected: "pass", input: {one: {a: 1}, two: {a: 1}}},
		{expected: "pass", input: {one: {a: 1, b: "2"}, two: {a: 1, b: "2"}}},
		{expected: "pass", input: {one: null, two: null}},
		{expected: "fail", input: {one: null, two: {a: 1}}},
		{expected: "fail", input: {one: null, two: undefined}},
		{expected: "pass", input: {one: undefined, two: undefined}},
	]
};
