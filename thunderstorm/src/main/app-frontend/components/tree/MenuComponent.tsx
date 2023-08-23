import * as React from "react";
import {generateHex} from "@intuitionrobotics/ts-common/utils/random-tools";
import {BaseComponent} from "../../core/BaseComponent";
import {Adapter} from "../adapter/Adapter";
import {Tree} from "./Tree";

export type MenuComponentProps = {
	adapter: Adapter
	childrenContainerStyle?: any
	onNodeClicked?: (path:string,item:any) => void
	onNodeDoubleClicked?: Function // TODO: Need to handle this
	id?: string
}

export class MenuComponent
	extends BaseComponent<MenuComponentProps> {
	private readonly id: string;

	constructor(props: MenuComponentProps) {
		super(props);
		this.id = this.props.id || generateHex(8);
	}

	render() {
		return <Tree
			id={this.id}
			adapter={this.props.adapter}
			onNodeClicked={this.props.onNodeClicked}
		/>
	}
}
