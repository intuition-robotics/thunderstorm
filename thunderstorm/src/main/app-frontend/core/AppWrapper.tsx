import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Router} from 'react-router-dom';
import {BrowserHistoryModule} from "../modules/HistoryModule";
import {Thunder} from "./Thunder";
import {ImplementationMissingException} from "@intuitionrobotics/ts-common/core/exceptions";

export type WrapperProps = {}
export const AppWrapper = (props: WrapperProps) => {

	const MainApp = Thunder.getInstance().getMainApp();
	if (!MainApp)
		throw new ImplementationMissingException("mainApp was not specified!!");

	return (
		<Router history={BrowserHistoryModule.getHistory()}>
			<MainApp/>
		</Router>)
};

export function renderApp(appId: string = "app") {
	ReactDOM.render(
		<AppWrapper/>,
		document.getElementById(appId)
	);
}
