import * as React from 'react';
import {Router} from 'react-router-dom';
// noinspection TypeScriptPreferShortImport`
import {BrowserHistoryModule} from "../modules/HistoryModule";
import {Thunder} from "./Thunder";
import {ImplementationMissingException} from "@intuitionrobotics/ts-common";
import {createRoot} from "react-dom/client";

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
    const el = document.getElementById(appId);
    if (!el)
        throw new Error(`Could not find element with id ${appId}`);

    const root = createRoot(el);
    root.render(<AppWrapper/>)
}
