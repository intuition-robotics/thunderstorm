import * as React from "react";
import {TreeNode} from "../tree/types";

export type ItemRendererProps<Item extends any = any> = { item: Item }
export type _BaseItemRenderer<ItemType> = React.ComponentType<ItemRendererProps<ItemType>>

export abstract class BaseItemRenderer<ItemType, S extends {} = {}>
	extends React.Component<ItemRendererProps<ItemType>, S> {

	render() {
		return this.renderItem(this.props.item);
	}

	protected abstract renderItem(item: ItemType): React.ReactNode;
}

export type NodeRendererProps<Item extends any = any> = { item: Item, node: TreeNode }
export type _BaseNodeRenderer<ItemType> = React.ComponentType<NodeRendererProps<ItemType>>

export abstract class BaseNodeRenderer<ItemType, S extends {} = {}>
	extends React.Component<NodeRendererProps<ItemType>, S> {

	render() {
		return this.renderItem(this.props.item);
	}

	protected abstract renderItem(item: ItemType): React.ReactNode;
}


export type BaseRendererMap<R extends React.ComponentType<any>> = {
	[k: string]: R
}

export type ItemRendererMap = BaseRendererMap<_BaseItemRenderer<any>>;
export type TreeRendererMap = BaseRendererMap<_BaseNodeRenderer<any>>;

