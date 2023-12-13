
import * as React from "react";
import {CSSProperties} from "react";
import {
	_keys,
	addItemToArray
} from "@intuitionrobotics/ts-common";
import {AccountModule} from "../modules/AccountModule";
import {Request_CreateAccount} from "../../shared/api";
import {
	ToastModule,
	TS_Input
} from "@intuitionrobotics/thunderstorm/frontend";

type State<T> = {
	data: Partial<T>
}
type Props<T> = {
	validate?: (data: Partial<T>) => string | undefined
}
const style: CSSProperties = {
	"height": "38px",
	"borderRadius": "25px",
	"backgroundColor": "#9c9ccd",
	"borderWidth": "0",
	"textAlign": "left",
	"padding": "0 15px",
	"color": "white",
	"marginTop": "10px"
};

type InputField = {
	type: 'text' | 'number' | 'password'
	label: string
	className?: string
	hint?: string
}

type Form<T> = { [K in keyof T]: InputField }

const form: Form<Request_CreateAccount> = {
	email: {
		className: "",
		type: "text",
		hint: "email",
		label: "Email",
	},
	password: {
		type: "password",
		hint: "****",
		label: "Password",
	},
	password_check: {
		type: "password",
		hint: "****",
		label: "Password Check",
	},
};

export class Component_Register
	extends React.Component<Props<Request_CreateAccount>, State<Request_CreateAccount>> {

	state = {
		data: {} as Partial<Request_CreateAccount>,
	};

	render() {
		const data = this.state.data;
		return <>
			<div className={'ll_v_c'} style={{justifyContent: 'space-evenly'}}>
				{_keys(form).map(key => {
					                 const field = form[key];
					                 return <TS_Input
						                 id={key}
						                 value={data[key]}
						                 type={field.type}
						                 placeholder={field?.hint}
						                 onChange={this.onValueChanged}
						                 onAccept={this.registerClicked}
					                 />
				                 }
				)}
			</div>
			<div className={'ll_h_c'} style={{justifyContent: 'center'}}>
				<button onClick={this.registerClicked} className={`clickable`} style={style}>Register
				</button>
			</div>
		</>;
	}

	private onValueChanged = (value: string, id: keyof Request_CreateAccount) => {
		this.setState(state => {
			state.data[id] = value;
			return state
		});
	};

	private registerClicked = () => {
		const data: Partial<Request_CreateAccount> = this.state.data;
		const errors = _keys(form).map(key => {
			const field = form[key];
			return data[key] ? undefined : `  * missing ${field.label}`;
		}).filter(error => !!error);

		const validateError = this.props.validate && this.props.validate(data);
		if (validateError)
			addItemToArray(errors, validateError);

		if (errors.length > 0)
			return ToastModule.toastError(`Wrong input:\n${errors.join("\n")}`);

		AccountModule.create(this.state.data as Request_CreateAccount)
	};
}
