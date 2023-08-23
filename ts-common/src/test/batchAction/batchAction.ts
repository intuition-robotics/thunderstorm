/*
 * ts-common is the basic building blocks of our typescript projects
 *
 * Copyright (C) 2020 Intuition Robotics
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
