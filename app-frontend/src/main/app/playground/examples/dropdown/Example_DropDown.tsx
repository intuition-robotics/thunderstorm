/*
 * Permissions management system, define access level for each of
 * your server apis, and restrict users by giving them access levels
 *
 * Copyright (C) 2020 Adam van der Kruk aka TacB0sS
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

import {
	AdapterBuilder,
	BaseNodeRenderer,
	DropDown,
	Example_NewProps,
	Props_DropDown,
	TreeRendererMap,
} from "@nu-art/thunderstorm/frontend";
import * as React from "react";
import {optionRendererStyle,} from "./Example_AllDropDowns";
import {
	FlatItemRenderer,
	FlatTitleRender,
} from "./Example_MultiRendererDropDown";
import {
	flatPlaguesWithTitles,
	Plague,
	plagues,
	PlagueWithTitle
} from "./consts";

export const flatRendererMap: TreeRendererMap = {
	normal: FlatItemRenderer,
	title: FlatTitleRender
};

export class Example_DropDown
	extends React.Component<{}, { _selected?: Plague, simpleAdapter: boolean }> {

	constructor(props: {}) {
		super(props);
		this.state = {
			simpleAdapter: false
		}
	}

	private plagues = plagues;

	addPlague = () => {
		this.plagues = [...this.plagues, plagues[0]]
		this.forceUpdate()
	};

	switchAdapter = () => {
		this.setState(state => ({simpleAdapter: !state.simpleAdapter}))
	};


	render() {
		return <Example_NewProps name={"Dropdown"} renderer={DropDown} data={[this.simpleAdapterProps(), this.complexAdapterProps()]}/>
	}

	private simpleAdapterProps() {
		return {
			id: "simple",
			key: "simple",
			adapter: AdapterBuilder()
				.list()
				.singleRender(ItemRenderer)
				.setData(plagues)
				.build(),
			onSelected: (item: Plague) => {
				console.log(`Simple Selected: ${item.label}`)
			},
			filter: (item: Plague) => [item.label],
			selectedItemRenderer: (selected?: Plague) => {
				if (!selected)
					return <div>{"Simple SHIT"}</div>

				return <div>{selected.label}</div>;
			},
		} as Props_DropDown<any> & { key: string };
	}

	private complexAdapterProps() {
		return {
			id: "complex",
			key: "complex",
			adapter: AdapterBuilder()
				.list()
				.multiRender(flatRendererMap)
				.setData(flatPlaguesWithTitles)
				.noGeneralOnClick()
				.build(),
			onSelected: (item: PlagueWithTitle) => {
				console.log(`Complex Selected: ${item.item.label}`)
			},
			filter: (item: PlagueWithTitle) => [item.item.label],
			selectedItemRenderer: (selected?: PlagueWithTitle) => {
				if (!selected)
					return <div>{"Complex SHIT"}</div>

				return <div>{selected.item.label}</div>;
			},
		} as Props_DropDown<any> & { key: string }
	}
}


export class ItemRenderer
	extends BaseNodeRenderer<Plague> {

	renderItem(item: Plague) {
		return (
			<div className="ll_h_c clickable match_width"
			     id={this.props.node.path}
			     onClick={(event: React.MouseEvent) => this.props.node.onClick(event)}
			     style={(this.props.node.focused || this.props.node.selected) ? {backgroundColor: "white"} : {}}>

				<div className={optionRendererStyle(this.props.node.selected)}>
					<div className={`ll_h_c match_width`} style={{justifyContent: "space-between"}}>
						<div style={this.props.node.focused ? {fontWeight: "bold"} : {}}>{item.label}</div>
						{this.props.node.selected && <img src={require('@res/icons/icon__check.svg')} width={12}/>}
					</div>
				</div>
			</div>
		);
	}
}