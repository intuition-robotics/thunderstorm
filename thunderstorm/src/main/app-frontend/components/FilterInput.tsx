import * as React from 'react';
import {Filter} from "@intuitionrobotics/ts-common/utils/filter-tools";
import {TS_Input} from "./TS_Input";
import {Stylable} from "../tools/Stylable";
import { generateHex } from '@intuitionrobotics/ts-common/utils/random-tools';
import { compare } from '@intuitionrobotics/ts-common/utils/object-tools';

export type Props_FilterInput<T> = Stylable & {
	filter: (item: T) => string[],
	list: T[],
	onChange: (items: T[], filterBy: string, id?: string) => void,
	id: string,
	initialFilterText?: string,
	focus?: boolean,
	placeholder?: string
	handleKeyEvent?: (e: KeyboardEvent) => void
}

type State = {}

export class FilterInput<T>
	extends React.Component<Props_FilterInput<T>, State> {
	private filterInstance: Filter;
	private notifyChanges: boolean;

	static defaultProps: Partial<Props_FilterInput<any>> = {
		id: generateHex(16)
	};

	constructor(props: Props_FilterInput<T>) {
		super(props);

		this.filterInstance = new Filter();
		this.filterInstance.setFilter(props.initialFilterText || '');
		this.notifyChanges = true;
	}

	componentDidMount() {
		this.callOnChange(this.props.list, "");
	}

	shouldComponentUpdate(nextProps: Readonly<Props_FilterInput<T>>, nextState: Readonly<State>, nextContext: any): boolean {
		const b = this.notifyChanges = !compare(this.props.list, nextProps.list);
		if (b)
			this.callOnChange(nextProps.list, "");

		return b;
	}

	callOnChange = (list: T[], filter: string) => {
		if (this.notifyChanges)
			this.props.onChange(this.filterInstance.filter(list, this.props.filter), filter, this.props.id);

		this.notifyChanges = false;
	};

	filter = (text: string) => {
		this.filterInstance.setFilter(text);
		this.notifyChanges = true;
		this.callOnChange(this.props.list, text);
	};

	render() {

		const {id, placeholder, focus} = this.props;
		return (
			<TS_Input
				type='text'
				id={id}
				value={this.props.initialFilterText}
				onChange={(text) => this.filter(text)}
				focus={focus}
				placeholder={placeholder}
				className={this.props.className}
				style={this.props.style}
				handleKeyEvent={this.props.handleKeyEvent}
			/>
		);
	}

}
