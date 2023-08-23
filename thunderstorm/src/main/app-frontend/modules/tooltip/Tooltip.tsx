import * as React from "react";
import {CSSProperties} from "react";
import {
	Tooltip_Model,
	TooltipListener,
	TooltipModule
} from "./TooltipModule";
import {BaseComponent} from "../../core/BaseComponent";
import { _setTimeout } from "@intuitionrobotics/ts-common/utils/date-time-tools";

type State = { model?: Tooltip_Model };

export const TooltipDefaultStyle: CSSProperties = {
	backgroundColor: "#f9f9f9",
	borderRadius: "3px",
	boxShadow: "0 0 4px 0 #00000066",
	color: "#333435",
	fontSize: "13px",
	padding: "1px 3px",
	position: "fixed",
};

export class Tooltip
	extends BaseComponent<{}, State>
	implements TooltipListener {

	private ref = React.createRef<HTMLDivElement>();
	private timeoutInterval?: number;

	__showTooltip = (model?: Tooltip_Model) => {
		this.setState(() => ({model}));
		if (!model)
			return;

		const duration = model.duration;
		if (duration <= 0)
			return;

		if (this.timeoutInterval)
			clearTimeout(this.timeoutInterval);

		this.timeoutInterval = _setTimeout(TooltipModule.hide, duration, model);
	};

	constructor(props: {}) {
		super(props);
		this.state = {};
	}

	render() {
		const {model} = this.state;
		if (!model || !model.content)
			return null;


		const top = model.location && model.location.y;
		const left = model.location && model.location.x;


		const positionStyle = {
			top: `${top}px`,
			left: `${left}px`
		};
		return <div ref={this.ref} id={"tooltip"} style={{...(model.style || TooltipDefaultStyle), ...positionStyle}}>
			{typeof model.content === "string" ? <div dangerouslySetInnerHTML={{__html: model.content}}/> : model.content}
		</div>
	}
}
