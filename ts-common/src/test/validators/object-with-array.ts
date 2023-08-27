
import {
	TestSuit,
	validateArray,
	validateExists,
	validateRegexp
} from "../_main";
import {ValidatorTest} from "./test";
import {validatorProcessor} from "./_common";

export type ObjectWithArray = { prop1?: string[] }
export const objectWithArray0: ObjectWithArray = {};
export const objectWithArray1: ObjectWithArray = {prop1: []};
export const objectWithArray2: ObjectWithArray = {prop1: ["Adam"]};
export const objectWithArray3: ObjectWithArray = {prop1: ["Adam", "Yair"]};

export const testSuit_objectWithArrayValidator: TestSuit<ValidatorTest<ObjectWithArray>> = {
	key: "object-validator--object-with-array",
	label: "Object Validator - Object With Array",
	processor: validatorProcessor,
	models: [
		{expected: "pass", input: {instance: objectWithArray0, validator: {prop1: undefined}}},
		{expected: "pass", input: {instance: objectWithArray0, validator: {prop1: validateExists(false)}}},
		{expected: "fail", input: {instance: objectWithArray0, validator: {prop1: validateExists(true)}}},
		{expected: "pass", input: {instance: objectWithArray0, validator: {prop1: validateArray(validateRegexp(/Adam/), false)}}},
		{expected: "pass", input: {instance: objectWithArray1, validator: {prop1: validateArray(validateRegexp(/Adam/))}}},
		{expected: "pass", input: {instance: objectWithArray1, validator: {prop1: validateArray(validateRegexp(/pah/))}}},
		{expected: "pass", input: {instance: objectWithArray2, validator: {prop1: validateArray(validateRegexp(/Adam/))}}},
		{expected: "fail", input: {instance: objectWithArray2, validator: {prop1: validateArray(validateRegexp(/pah/))}}},
		{expected: "pass", input: {instance: objectWithArray3, validator: {prop1: validateArray(validateRegexp(/Adam|Yair/))}}},
		{expected: "fail", input: {instance: objectWithArray3, validator: {prop1: validateArray(validateRegexp(/pah/))}}},
	]
};
