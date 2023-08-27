
import {ValidatorTest,} from "./test";
import {
	validateArray,
	validateRegexp,
	TestSuit
} from "../_main";
import {
	ObjectWithArray,
	objectWithArray1,
	objectWithArray2,
	objectWithArray3
} from "./object-with-array";
import {validatorProcessor} from "./_common";

type ObjectWithNestedArray = { prop2: ObjectWithArray }
const objectWithNestedArray0: ObjectWithNestedArray = {prop2: objectWithArray1};
const objectWithNestedArray1: ObjectWithNestedArray = {prop2: objectWithArray2};
const objectWithNestedArray2: ObjectWithNestedArray = {prop2: objectWithArray3};

export const testSuit_nestedObjectWithArrayValidator: TestSuit<ValidatorTest<ObjectWithNestedArray>> = {
	key: "object-validator--nested-object-with-array",
	label: "Object Validator - Nested Object With Array",
	processor: validatorProcessor,
	models: [
		{expected: "pass", input: {instance: objectWithNestedArray0, validator: {prop2: {prop1: validateArray(validateRegexp(/Adam/))}}}},
		{expected: "pass", input: {instance: objectWithNestedArray0, validator: {prop2: {prop1: validateArray(validateRegexp(/pah/))}}}},
		{expected: "pass", input: {instance: objectWithNestedArray1, validator: {prop2: {prop1: validateArray(validateRegexp(/Adam/))}}}},
		{expected: "fail", input: {instance: objectWithNestedArray1, validator: {prop2: {prop1: validateArray(validateRegexp(/pah/))}}}},
		{expected: "pass", input: {instance: objectWithNestedArray2, validator: {prop2: {prop1: validateArray(validateRegexp(/Adam|Yair/))}}}},
		{expected: "fail", input: {instance: objectWithNestedArray2, validator: {prop2: {prop1: validateArray(validateRegexp(/pah/))}}}},
	]
};
