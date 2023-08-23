import * as React from "react";
import {Adapter} from "../adapter/Adapter";

export type TreeNode = {
	propKey: string
	path: string
	item: any
	adapter: Adapter
	expandToggler: (e: React.MouseEvent, expand?: boolean) => void
	onClick: (e: React.MouseEvent) => void
	onFocus: (e: React.MouseEvent) => void
	expanded: boolean
	focused: boolean
	selected: boolean
};
