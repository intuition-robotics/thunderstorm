

import {testSuit_simpleObjectValidator} from "./simple-object";
import {testSuit_nestedObjectValidator} from "./nested-object";
import {testSuit_objectWithArrayValidator} from "./object-with-array";
import {testSuit_nestedObjectWithArrayValidator} from "./nested-object-with-array";
import {testSuit_dynamicPropsObjectValidator} from "./dynamic-props-object";
import {TestModel, ValidatorTypeResolver} from "../_main";

export type ValidatorTestInput<T> = {
    instance: T;
    validator: ValidatorTypeResolver<T>;
}

export type ValidatorTest<T> = TestModel<ValidatorTestInput<T>, "pass" | "fail">;

export const testSuits_validator = [
    testSuit_dynamicPropsObjectValidator,
    testSuit_simpleObjectValidator,
    testSuit_nestedObjectValidator,
    testSuit_objectWithArrayValidator,
    testSuit_nestedObjectWithArrayValidator,
];
