import * as React from "react";
import {BaseComponent} from "@intuitionrobotics/thunderstorm/frontend";
import {
	OnPermissionsChanged,
	PermissionsFE
} from "./PermissionsModuleFE";

type Props = {
	url: string
	loadingComponent?: React.ComponentType
	fallback?: React.ComponentType
	children: React.ReactNode
}

export class PermissionsComponent
	extends BaseComponent<Props>
	implements OnPermissionsChanged {

	__onPermissionsChanged() {
		this.forceUpdate();
	}

	render() {
		const permitted = PermissionsFE.doesUserHavePermissions(this.props.url);
		if (permitted === undefined)
			return this.props.loadingComponent ? <this.props.loadingComponent/> : null;

		if (permitted)
			return this.props.children;

		if (this.props.fallback)
			return <this.props.fallback/>;

		return null;
	}
}
