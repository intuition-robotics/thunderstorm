

// import * as React from "react";
//
// export type InferItemType<R> = R extends Renderer<infer Item> ? Item : "Make sure the Renderer Renders the correct item type e.g. (props:{item:Item}) => React.ReactNode";
//
// export type Renderer<Item> = React.ElementType<{ item: Item }>
//
// export type RendererMap<T extends any = any> = {
// 	[k: string]: Renderer<T>
// }
//
// export type ItemWrapper<Rm extends RendererMap, K extends keyof Rm = keyof Rm, Item = InferItemType<Rm[K]>> = {
// 	item: Item
// 	type: K
// }
//
// export type GenericRenderer<Rm extends RendererMap, ItemType extends ItemWrapper<Rm> = ItemWrapper<Rm>> = {
// 	rendererMap: Rm
// 	items: ItemType[]
// }
