

import {
	_values,
	TypedMap
} from "../_main";
import {
	TestModel,
	TestSuit
} from "../../main/testing/test-model";


type FilterKeys = TypedMap<boolean | TypedMap<boolean | TypedMap<boolean>>>

type VersionTest = TestModel<FilterKeys, boolean>;

export const testSuit_filter: TestSuit<VersionTest> = {
	key: 'filters',
	label: "filter",
	processor: async (model: FilterKeys) => {
		return isFilterActive(model);
	},
	models: [
		{input: {one: true, two: false}, expected: true},
		{input: {one: true, two: true}, expected: false},
		{
			input: {
				one: {
					a: true,
					b: {
						a: true,
						b: true
					}
				}, two: true
			}, expected: false
		},
		{
			input: {
				one: {
					a: true, b: true
				}, two: true
			}, expected: false
		}
	]
};

const isFilterActive = (keys: FilterKeys): boolean => {

	return !_values(keys).every((module): boolean => {
		if (typeof module === 'boolean')
			return module

		return _values(module).every((provider): boolean => {
			if (typeof provider === 'boolean')
				return provider

			return _values(provider).every((type): boolean => {
				return type
			})
		})
	})
}
