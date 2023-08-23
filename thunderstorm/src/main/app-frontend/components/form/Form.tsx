import {
	Form,
	Form_FieldProps,
	FormRenderer
} from "./types";
import * as React from "react";
import { TypeValidator } from "@intuitionrobotics/ts-common/validator/validator";
import { ObjectTS } from "@intuitionrobotics/ts-common/utils/types";
import { _keys } from "@intuitionrobotics/ts-common/utils/object-tools";


export type FormProps<T extends object = object> = {
	form: Form<T>,
	renderer: FormRenderer<T>,
	value: Partial<T>,
	validator?: TypeValidator<T>,
	className?: string,
	onAccept: (value: T) => void;
}

type Props<T extends object = object> = FormProps<T> & {
	showErrors: boolean
}

type State<T extends object = object> = { value: Partial<T> };

export class Component_Form<T extends ObjectTS = ObjectTS>
	extends React.Component<Props<T>, State<T>> {

	constructor(p: Props<T>) {
		super(p);
		this.state = {value: p.value}
	}

	render() {
		const data = this.state.value;
		return (
			<div className={`ll_v_c ${this.props.className}`} style={{justifyContent: 'space-evenly'}}>
				{_keys(this.props.form).map(key => this.renderField(data, key))}
			</div>
		)
	}

	private renderField(data: Partial<T>, key: keyof T) {
		const field = this.props.form[key];
		const fieldProps: Form_FieldProps<T> = {
			key,
			field,
			value: data[key],
			onChange: this.onValueChanged,
			showErrors: this.props.showErrors,
			validator: this.props.validator?.[key],
			onAccept: () => {
				this.props.onAccept(this.state.value as T);
			}
		};
		return this.props.renderer[key](fieldProps);
	}

	private onValueChanged = (value: any, id: keyof T) => {
		this.setState(state => {
			state.value[id] = value;
			return state
		});
	};
}
