import * as React from "react";
import {
	NavLink,
	Link,
	Route
} from "react-router-dom";
import {ReactEntryComponentInjector} from "../component-loader/ReactEntryComponentInjector";

export type RouteParams = { [key: string]: string | number | (() => string | number) }

export class RoutePath {
	readonly key: string;
	readonly path: string;
	readonly component: React.ComponentType<any> | string;

	public exact: boolean = false;
	public logMessage?: string;
	public label?: string;
	public visible: () => boolean = () => !!this.label;
	public enabled?: () => boolean;

	constructor(key: string, route: string, component: React.ComponentType<any> | string) {
		this.key = key;
		this.path = route;
		this.component = component;
	}

	setLogMessage(logMessage: string) {
		this.logMessage = logMessage;
		return this;
	}

	setLabel(label: string) {
		this.label = label;
		return this;
	}

	setVisible(visible: () => boolean) {
		this.visible = visible;
		return this;
	}

	setEnabled(enabled: () => boolean) {
		this.enabled = enabled;
		return this;
	}

	setExact(exact: boolean) {
		this.exact = exact;
		return this;
	}

	compose(params?: RouteParams) {
		const paramsAsString = RoutePath.composeStringQuery(params);

		return this.path + paramsAsString;
	}

	static composeStringQuery(params?: RouteParams) {
		let paramsAsString = "";

		if (params)
			paramsAsString = Object.keys(params).reduce((toRet, key) => {
				let param = params[key];
				if (typeof param === "function")
					param = param();

				return `${toRet}&${key}=${param}`;
			}, paramsAsString);

		if (paramsAsString.length > 0)
			paramsAsString = `?${paramsAsString.substring(1)}`;

		return paramsAsString;
	}
}

const activeStyle = {color: 'blue'};

export const defaultNavLinkNode = (route: RoutePath): React.ReactElement => {
	return <NavLink key={route.key} to={route.path} activeStyle={activeStyle}>{route.label}</NavLink>;
};

export const defaultLinkNode = (route: RoutePath, node?: React.ReactNode): React.ReactElement => {
	return <Link key={route.key} to={route.path}>{node || route.label || route.key}</Link>;
};

export const defaultRouteNode = (route: RoutePath): React.ReactElement => {
	if (typeof route.component === "string")
		return <ReactEntryComponentInjector src={route.component}/>;

	return <Route exact={route.exact} key={route.key} path={route.path} component={route.component} />;
};
