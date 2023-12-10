import * as React from "react";
import Select, {components} from "react-select";
import {ReactNode} from "react";

type Props<T> = {
	iconClose: ReactNode,
	iconOpen: ReactNode,
	options?: T[]
	selectedOption?: T
	onChange: (t: T) => void
	styles: any;
	presentation: (t: T) => string
	placeholder?: string | undefined
	components?: any | undefined
	isDisabled?: boolean
}

type State = {
	menuIsOpen: boolean
}

export class GenericSelect<T>
	extends React.Component<Props<T>, State> {

	constructor(props: Props<T>) {
		super(props);
		this.state = {
			menuIsOpen: false
		};
		this.handleSelection = this.handleSelection.bind(this);
	}

	render() {
		const props = this.props;
		const items: SelectItem[] = [];
		const options = props.options;
		let value: SelectItem | null = null;
		if (options) {
			const selectedOption = props.selectedOption;
			options.forEach((option, idx) => {
				const optionPresentation = props.presentation(option)
				const item: SelectItem = {label: optionPresentation, value: "" + idx};
				if (selectedOption !== undefined) {
					if (optionPresentation === props.presentation(selectedOption)) {
						value = item;
					}
				}
				items.push(item);
			});
		}

		return <Select
			options={items}
			value={value}
			onChange={item => this.handleSelection(item as SelectItem)}
			onMenuClose={() => this.setState({menuIsOpen: false})}
			onMenuOpen={() => this.setState({menuIsOpen: true})}
			styles={this.props.styles}
			placeholder={props.placeholder}
			components={props.components ? props.components : {
				IndicatorSeparator: () => null,
				DropdownIndicator: (_props: any) => (
					<components.DropdownIndicator {..._props}>
						{this.state.menuIsOpen ? props.iconClose : props.iconOpen}
					</components.DropdownIndicator>
				)
			}}
			isDisabled={props.isDisabled}
		/>;
	}

	handleSelection(item: SelectItem) {
		if (!this.props.options)
			return;
		const idx = Number(item.value);
		const option = this.props.options[idx];
		this.props.onChange(option);
	}

}

class SelectItem {
	value?: string;
	label: string;

	constructor(s: string) {
		this.value = s;
		this.label = s;
	}
}
