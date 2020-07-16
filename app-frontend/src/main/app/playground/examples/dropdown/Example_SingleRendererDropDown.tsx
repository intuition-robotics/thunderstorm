import * as React from "react";
import {
	customInputStyle,
	optionRendererStyle,
	Plague,
	plagues
} from "./Example_DropDowns";
import {css} from "emotion";
import {ICONS} from "@res/icons";
import {
	HeaderStyleProps,
	InputProps,
	inputStyle,
	ValueProps,
	Adapter,
	AdapterBuilder,
	headerStyle,
	DropDown,
	BaseNodeRenderer
} from "@nu-art/thunderstorm/frontend";

export class Example_SingleRendererDropDown
	extends React.Component<{}, { _selected?: Plague }> {

	onSelected = (plague: Plague) => {
		this.setState({_selected: plague});
	};

	render() {
		const valueRenderer = (props: ValueProps<Plague>) => {
			const style: React.CSSProperties = {backgroundColor: "lime", boxSizing: "border-box", height: "100%", width: "100%", padding: "4px 7px"};
			if (props.selected)
				return <div style={{...style, color: "red"}}>{props.selected.label}</div>;
			return <div style={style}>{props.placeholder}</div>
		};
		const inputResolver = (selected?: Plague): InputProps => (
			{
				className: customInputStyle(!!selected),
				inputStyle,
				placeholder: this.state?._selected?.label
			}
		);
		const headerResolverClass: HeaderStyleProps = {headerStyle, headerClassName: css({boxShadow: "5px 10px #888888"})};
		const simpleAdapter: Adapter = AdapterBuilder()
			.list()
			.singleRender(ItemRenderer)
			.setData(plagues)
			.build();
		return <div>
			<h4>Filter, carets, placeholder & all renderers</h4>
			<h4>single renderer, flat list</h4>
			<DropDown
				adapter={simpleAdapter}
				onSelected={this.onSelected}
				valueRenderer={valueRenderer}
				inputResolver={inputResolver}
				filter={(item) => [item.label.toLowerCase()]}
				mainCaret={<div style={{backgroundColor: "lime", paddingRight: 8}}><div style={{marginTop:3}}>{ICONS.arrowOpen(undefined, 11)}</div></div>}
				closeCaret={<div style={{backgroundColor: "lime", paddingRight: 8}}><div style={{marginTop:3}}>{ICONS.arrowClose(undefined, 11)}</div></div>}
				placeholder={"Choose a plague"}
				headerStyleResolver={headerResolverClass}
				autocomplete={true}
			/>
			<h4>{this.state?._selected ? `You chose ${this.state._selected.value}` : "You didn't choose yet"}</h4>
		</div>
	}
}

export class ItemRenderer
	extends BaseNodeRenderer<Plague> {

	renderItem(item: Plague) {
		return (
			<div className="ll_h_c clickable match_width"
			     id={this.props.node.path}
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