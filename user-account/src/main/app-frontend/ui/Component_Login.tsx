
import * as React from "react";
import {CSSProperties} from "react";
import {
	_keys,
	addItemToArray
} from "@intuitionrobotics/ts-common";
import {AccountModule} from "../modules/AccountModule";
import {Request_LoginAccount} from "../../shared/api";
import {
	ToastModule,
	TS_Input
} from "@intuitionrobotics/thunderstorm/frontend";

export type ValueAndError = {
	value?: string
	error?: string
}

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
	label: string
	hint: string
	type: 'text' | 'number' | 'password'
}

type Form<T> = { [K in keyof T]: InputField }

const form: Form<Omit<Request_LoginAccount, "frontType">> = {
	email: {
		type: "text",
		hint: "email",
		label: "Email",
	},
	password: {
		type: "password",
		hint: "****",
		label: "Password",
	}
};

export class Component_Login
	extends React.Component<Props<Request_LoginAccount>, State<Request_LoginAccount>> {

	state = {
		data: {} as Partial<Request_LoginAccount>,
	};

	render() {
		const data = this.state.data;
		return <>
			<div className={'ll_v_c'} style={{justifyContent: 'space-evenly'}}>
				{_keys(form).map(key => {
					                 const field = form[key];
					                 return <TS_Input
						                 id={key}
						                 key={key}
						                 value={data[key]}
						                 type={field.type}
						                 placeholder={field.hint}
						                 onChange={this.onValueChanged}
						                 onAccept={this.loginClicked}
					                 />;
				                 }
				)}
			</div>
			<div className={'ll_h_c'} style={{justifyContent: 'center'}}>
				<button onClick={this.loginClicked} className={`clickable`} style={style}>Login
				</button>
			</div>
		</>;
	}

	private onValueChanged = (value: string, id: keyof Omit<Request_LoginAccount, "frontType">) => {
		this.setState(state => {
			state.data[id] = value;
			return state;
		});
	};

	private loginClicked = () => {
		const data: Partial<Request_LoginAccount> = this.state.data;
		const errors = _keys(form).map(key => {
			const field = form[key];
			return data[key] ? undefined : `  * missing ${field.label}`;
		}).filter(error => !!error);

		const validateError = this.props.validate && this.props.validate(data);
		if (validateError)
			addItemToArray(errors, validateError);

		if (errors.length > 0)
			return ToastModule.toastError(`Wrong input:\n${errors.join("\n")}`);

		AccountModule.login(this.state.data as Request_LoginAccount);
	};
}
