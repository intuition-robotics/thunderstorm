
import {
	validateRegexp,TestSuit
} from "../_main";
import {
	ValidatorTest,
} from "./test";
import {validatorProcessor} from "./_common";

const simpleObject1: {} = {prop1: "Adam"};
const simpleObject2: {} = {prop1: "Adam", prop2: undefined};

export const testSuit_simpleObjectValidator: TestSuit<ValidatorTest<{}>> = {
	key: "object-validator--simple-object",
	label: "Object Validator - Simple Object",
	processor: validatorProcessor,
	models: [
		{expected: "fail", input: {instance: simpleObject1, validator: {}}},
		{expected: "fail", input: {instance: simpleObject1, validator: {prop1: validateRegexp(/PaH/)}}},
		{expected: "pass", input: {instance: simpleObject1, validator: {prop1: validateRegexp(/Adam/)}}},
		{expected: "fail", input: {instance: {}, validator: {prop1: validateRegexp(/PaH/)}}},
		{expected: "pass", input: {instance: {}, validator: {prop1: validateRegexp(/PaH/, false)}}},
		{expected: "fail", input: {instance: simpleObject1, validator: {prop1: validateRegexp(/Adam/), prop2: validateRegexp(/Adam/)}}},
		{expected: "pass", input: {instance: simpleObject1, validator: {prop1: validateRegexp(/Adam/), prop2: validateRegexp(/Adam/, false)}}},
		{expected: "fail", input: {instance: simpleObject2, validator: {prop1: validateRegexp(/Adam/), prop2: validateRegexp(/Adam/)}}},
		{expected: "pass", input: {instance: simpleObject2, validator: {prop1: validateRegexp(/Adam/), prop2: validateRegexp(/Adam/, false)}}},
		{expected: "pass", input: {instance: simpleObject2, validator: {prop1: validateRegexp(/Adam/), prop2: undefined}}},
	]
};
