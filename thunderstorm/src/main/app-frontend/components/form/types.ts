import { ObjectTS } from "@intuitionrobotics/ts-common/utils/types";
import { ValidatorTypeResolver } from "@intuitionrobotics/ts-common/validator/validator";
import * as React from "react";

export type InputField<T, K extends keyof T = keyof T> = {
	type: 'text' | 'number' | 'password'
	label: string
	className?: string
	hint?: string
}

export type Form<T extends ObjectTS> = { [K in keyof T]: InputField<T, K> }
export type FormRenderer<T extends ObjectTS> = { [K in keyof T]: (value: Form_FieldProps<T, K>) => React.ReactNode }

export type Form_FieldProps<T extends ObjectTS = ObjectTS, K extends keyof T = keyof T> = {
	key: K
	showErrors: boolean
	field: InputField<T, K>
	value?: T[K]
	validator?: ValidatorTypeResolver<T[K]>
	onChange: (value: any, id: K) => void;
	onAccept: () => void;
};
