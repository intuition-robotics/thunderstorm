/*
 * A typescript & react boilerplate with api call example
 *
 * Copyright (C) 2020 Intuition Robotics
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as React from "react";
import {
	noButton,
	showAppConfirmationDialogExample,
	showDefaultInfoModalExample
} from "../../themes/dialog";
import {ToastModule} from "@intuitionrobotics/thunderstorm/frontend";


export class Example_Dialogs
	extends React.Component {
	constructor(props: {}) {
		super(props);

		this.state = {
			formFields: {},
		};
	}

	showDefaultInfoModalExample = () => {
		showDefaultInfoModalExample()
	};

	showAppConfirmationDialogExample = () => {
		showAppConfirmationDialogExample()
	};

	showAppToasterSuccessExample = () => {
		ToastModule.toastSuccess("Simple success message");
	};

	showAppToasterErrorExample = () => {
		ToastModule.toastError("Simple error message");
	};

	showAppToasterInfoExample = () => {
		ToastModule.toastInfo("Simple info message");
	};

	render() {
		return <>
			<button style={{marginRight: 8}} onClick={noButton}>No Button</button>
			<button style={{marginRight: 8}} onClick={this.showDefaultInfoModalExample}>Default Dialog Example</button>
			<button style={{marginRight: 8}} onClick={this.showAppConfirmationDialogExample}>Custom Dialog Example</button>

			<button style={{marginRight: 8}} onClick={this.showAppToasterSuccessExample}>Toaster Default Success Example</button>
			<button style={{marginRight: 8}} onClick={this.showAppToasterErrorExample}>Toaster Default Failure Example</button>
			<button style={{marginRight: 8}} onClick={this.showAppToasterInfoExample}>Toaster Default Info Example</button>
		</>;
	}
}
