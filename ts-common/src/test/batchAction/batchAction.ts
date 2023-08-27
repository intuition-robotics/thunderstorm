
import {
	batchAction,
	TestModel,
	TestSuit
} from "../_main";

type BatchActionInput = {
	chunk: number;
	input: number[];
}

type BatchActionTest = TestModel<BatchActionInput, "pass" | "fail">;

export const testSuit_batchAction: TestSuit<BatchActionTest> = {
	key: "batchAction",
	label: "Batch Action",
	processor: async (input) => {
		const sums = await batchAction(input.input, input.chunk, async (elements: number[], chunk: number) => {
			return elements.reduce((sum, el) => sum + el, 0) * (chunk + 1)
		})

		return sums.length && sums[sums.length - 1] === input.input[input.input.length - 1] * (input.input.length / input.chunk) ? "pass" : "fail"
	},
	models: [
		{expected: "pass", input: {input: [1,1,1,1,1], chunk: 1}},
		{expected: "pass", input: {input: [3,3,3,3,3], chunk: 1}},
		{expected: "fail", input: {input: [1,1,1,1,1], chunk: 0}},
		{expected: "fail", input: {input: [1,2,1,1,2], chunk: 3}}
	]
};
