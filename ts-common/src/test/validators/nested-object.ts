
import {
	ValidatorTest,
} from "./test";
import {
	validateRange,
	validateRegexp,
	validateValue,
	TestSuit
} from "../_main";
import {validatorProcessor} from "./_common";

type SubNestedObject = object & {
	prop3?: string;
	prop4?: number;
}
type NestedObject = {
	prop1?: string;
	prop2?: SubNestedObject;
}

const nestedObject1: NestedObject = {prop1: "Adam", prop2: {prop3: "pah", prop4: 71070}};
const nestedObject2: NestedObject = {prop1: "Adam", prop2: undefined};
const nestedObject3: NestedObject = {prop1: "Adam"};

export const testSuit_nestedObjectValidator: TestSuit<ValidatorTest<NestedObject>> = {
	key: "object-validator--nested-object",
	label: "Object Validator - Nested Object",
	processor: validatorProcessor,
	models: [{expected: "fail", input: {instance: nestedObject1, validator: {}}},
		{expected: "fail", input: {instance: nestedObject1, validator: {prop1: validateRegexp(/PaH/)}}},
		{expected: "fail", input: {instance: nestedObject1, validator: {prop1: validateRegexp(/Adam/)}}},
		{expected: "fail", input: {instance: nestedObject1, validator: {prop1: validateRegexp(/Adam/)}}},
		{expected: "fail", input: {instance: nestedObject2, validator: {prop1: validateRegexp(/Adam/)}}},
		{expected: "fail", input: {instance: nestedObject1, validator: {prop1: validateRegexp(/Adam/), prop2: {}}}},
		{expected: "fail", input: {instance: nestedObject1, validator: {prop1: validateRegexp(/Adam/), prop2: {prop3: validateValue(["zevel"])}}}},
		{expected: "fail", input: {instance: nestedObject1, validator: {prop1: validateRegexp(/Adam/), prop2: {prop3: validateValue(["pah"])}}}},
		{
			expected: "fail", input: {
				instance: nestedObject1, validator: {
					prop1: validateRegexp(/Adam/), prop2: {prop3: validateValue(["pah", "zevel"]), prop4: validateRange([[10, 30]])}
				}
			}
		},
		{
			expected: "pass", input: {
				instance: nestedObject1, validator: {
					prop1: validateRegexp(/Adam/), prop2: {prop3: validateValue(["pah", "zevel"]), prop4: validateRange([[10, 80000]])}
				}
			}
		},
		{expected: "pass", input: {instance: nestedObject3, validator: {prop1: validateRegexp(/Adam/)}}},
	]
};
