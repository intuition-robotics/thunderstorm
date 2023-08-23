import {ObjectTS} from "@intuitionrobotics/ts-common/utils/types";
import {CSSProperties} from "react";
import {Stylable} from "../tools/Stylable";
import React = require("react");

export type HeaderRenderer<T extends ObjectTS> = {
	[P in keyof T]: (columnKey: P) => React.ReactNode
};

export type ActionItemRenderer<P> = (rowIndex: number, actionKey: P) => React.ReactNode;
export type ActionsRenderer<A extends ObjectTS> = {
	[P in keyof A]: ActionItemRenderer<P>
};

export type CellRenderer<P, V, T> = (cellValue: V, rowIndex: number, columnKey: P, rowObject: T) => React.ReactNode;
export type RowRenderer<T extends ObjectTS> = {
	[P in keyof T]: CellRenderer<P, T[P], T>
};

export type CellStyle<P, V, T> = (rowObject: T, rowIndex: number, cellValue?: V, columnKey?: P) => Stylable;
export type TableProps<T extends ObjectTS, A extends ObjectTS = never> = Stylable & {
	id: string,
	header: (keyof T)[],
	rows: T[],
	headerRenderer: ((columnKey: keyof T) => React.ReactNode) | HeaderRenderer<T>,
	cellRenderer: CellRenderer<keyof T, T[keyof T], T> | RowRenderer<T>
	actions?: (keyof A)[],
	actionsRenderer?: ActionsRenderer<A> | ActionItemRenderer<keyof A>
	body?: Stylable
	tr?: Stylable | ((rowValue: T, rowIndex: number) => Stylable)
	td?: Stylable | CellStyle<keyof T, T[keyof T], T>
};

export class TS_Table<T extends ObjectTS, A extends ObjectTS = never>
	extends React.Component<TableProps<T, A>, any> {
	constructor(p: TableProps<T, A>) {
		super(p);
	}

	render() {
		return <table className={this.props.className} style={this.props.style as CSSProperties}>
			<tbody className={this.props.body?.className} style={this.props.body?.style as CSSProperties}>
			{this.renderTableHeader()}
			{this.renderTableBody()}
			</tbody>
		</table>;
	}

	private renderTableHeader() {
		let renderers: HeaderRenderer<T>;
		if (typeof this.props.headerRenderer === "object")
			renderers = this.props.headerRenderer;
		else
			renderers = this.props.header.reduce((toRet, headerProp) => {
				toRet[headerProp] = this.props.headerRenderer as ((columnKey: keyof T) => React.ReactNode);
				return toRet;
			}, {} as HeaderRenderer<T>);

		const trClassName = typeof this.props.tr === 'object' ? this.props.tr?.className : '';
		const trStyle = (typeof this.props.tr === 'object' ? this.props.tr?.style : {}) as CSSProperties;
		const tdClassName = typeof this.props.td === 'object' ? this.props.td?.className : '';
		const tdStyle = (typeof this.props.td === 'object' ? this.props.td?.style : {}) as CSSProperties;
		return (
			<tr key={`${this.props.id}-0`} className={trClassName} style={trStyle}>
				{this.props.header.map(
					(header, index) => <td
						key={`${this.props.id}-${index}`}
						className={tdClassName}
						style={tdStyle}>
						{renderers[header](header)}
					</td>)}
				{this.props.actions?.map((action, index) => <td
					key={`${this.props.id}-${this.props.header.length + index}`}/>
				)}
			</tr>
		);
	}

	private renderTableBody() {
		let renderers: RowRenderer<T>;
		if (typeof this.props.cellRenderer === "object")
			renderers = this.props.cellRenderer;
		else
			renderers = this.props.header.reduce((toRet, headerProp) => {
				toRet[headerProp] = this.props.cellRenderer as CellRenderer<keyof T, T[keyof T], T>;
				return toRet;
			}, {} as RowRenderer<T>);

		let actionsRenderers: ActionsRenderer<A> | undefined;
		if (typeof this.props.actionsRenderer === "object")
			actionsRenderers = this.props.actionsRenderer;
		else
			actionsRenderers = this.props.actions?.reduce((toRet, actionKey) => {
				toRet[actionKey] = this.props.actionsRenderer as ActionItemRenderer<keyof A>;
				return toRet;
			}, {} as ActionsRenderer<A>);


		return this.props.rows.map((row, rowIndex) => {
			const trStyleable = this.resolveTRStyleable(row, rowIndex);
			return <tr key={`${this.props.id}-${rowIndex}`} className={trStyleable?.className} style={trStyleable?.style}>
				{this.props.header.map((header, columnIndex) => {
					const tdStyleable = this.resolveTDStyleable(row, rowIndex, row[header], header);
					return <td key={`${this.props.id}-${columnIndex}`}
					           className={tdStyleable?.className}
					           style={tdStyleable?.style}>
						{renderers[header](row[header], rowIndex, this.props.header[columnIndex], row)}
					</td>;
				})}
				{this.props.actions?.map((actionKey, index) => {
					const actionStyleable = this.resolveTDStyleable(row, rowIndex);
					return <td key={`${this.props.id}-${this.props.header.length + index}`} className={actionStyleable?.className}
					           style={actionStyleable?.style}>
						{actionsRenderers?.[actionKey](rowIndex, actionKey)}
					</td>;
				})}
			</tr>;
		});
	}

	private resolveTDStyleable(rowObject: T, rowIndex: number, cellValue?: T[keyof T], columnKey?: keyof T): Stylable | undefined {
		if (!this.props.td)
			return;

		if (typeof this.props.td === 'function')
			return this.props.td(rowObject, rowIndex, cellValue, columnKey)

		return this.props.td;
	}

	private resolveTRStyleable(row: T, rowIndex: number): Stylable | undefined {
		if (!this.props.tr)
			return;

		if (typeof this.props.tr === 'function')
			return this.props.tr(row, rowIndex)

		return this.props.tr;
	}
}
