import { _keys } from "@intuitionrobotics/ts-common/utils/object-tools";
import {Adapter} from "../adapter/Adapter";
import {BaseRendererMap} from "../adapter/BaseRenderer";

export class MultiTypeAdapter<Rm extends BaseRendererMap<any>, T extends any = any>
	extends Adapter<T> {

	private readonly rendererMap: Rm;

	constructor(data: any, rendererMap: Rm) {
		super(data);
		this.hideRoot = true;
		this.rendererMap = rendererMap;
	}


	filter(obj: any, key: keyof any): boolean {
		return key !== "item" && key !== 'rendererType';
	}

	adjust(obj: any): { data: any; deltaPath: string } {
		if (!_keys(obj).find(key => key === "_children"))
			return {data: obj, deltaPath: ""};

		// @ts-ignore
		const objElement = obj['_children'];
		// @ts-ignore
		objElement.type = obj.type;
		// @ts-ignore
		objElement.item = obj.item;

		// @ts-ignore
		return {data: objElement, deltaPath: '_children'};

	}

	resolveRenderer(propKey: string): any {
		return this.rendererMap[propKey];
	}
}

//
// export const GenericRenderer_Default = (rendererMap: RendererMap) => {
//
// 	const renderCollapse = (expanded: boolean) => {
// 		const Comp = expanded ? Expanded : Collapsed;
// 		return <Comp style={{color: "#00000050", verticalAlign: "text-top"}}/>
// 	};
//
// 	return (props: TreeNode) => {
// 		const itemWrapper = props.item as MenuItemWrapper<any, any>;
// 		const item = itemWrapper.item;
// 		const type = itemWrapper.type;
// 		// props.item=item;
// 		const MyRenderer = rendererMap[type as string];
// 		// @ts-ignore
// 		const hasChildren = itemWrapper.length;
//
// 		return (
// 			<div style={hasChildren && {display: 'flex', justifyContent: 'space-between'}}>
// 				<MyRenderer item={item}/>
// 				{hasChildren && <div
// 					id={props.path}
// 					onMouseDown={stopPropagation}
// 					onMouseUp={(e) => props.expandToggler(e, !props.expanded)}
// 					style={{cursor: "pointer", marginRight: 10}}
// 				>{renderCollapse(props.expanded)}</div>}
// 			</div>
// 		)
// 	};
// };
