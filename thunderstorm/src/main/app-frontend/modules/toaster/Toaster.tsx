import * as React from "react";
import {CSSProperties} from "react";
import {Toast_Model} from "./ToasterModule";
import {
	BaseToaster,
	ToastProps
} from "./BaseToaster";

export class Toaster
	extends BaseToaster {

	constructor(props: ToastProps) {
		super(props);
	}

	protected renderToaster(toast: Toast_Model) {
		const horizontal = toast.positionHorizontal;
		const vertical = toast.positionVertical;

		const style: CSSProperties = {
			justifyContent: "space-between",
			borderRadius: "4px",
			letterSpacing: "4px",
			boxShadow: "0 2px 5px 0 rgba(0, 0, 0, 0.28), 1px 2px 4px 0 rgba(0, 0, 0, 0.5)",
			position: "fixed",
			margin: "16px",
			background: toast.bgColor,
			bottom: vertical === "top" ? "unset" : 2,
			top: vertical === "top" ? 0 : "unset",
			left: horizontal === "left" ? 0 : horizontal === "center" ? "50%" : "unset",
			right: horizontal === "right" ? 0 : horizontal === "center" ? "auto" : "unset",
			transform: horizontal === "center" ? "translateX(-50%)" : "unset",
			zIndex: 9999
		};

		return (
			<div className={`ll_h_t ${toast.className}`} style={{...style, ...toast.style}}>
				{typeof toast.content === "string" ? <div dangerouslySetInnerHTML={{__html: toast.content}}/> : toast.content}
				{this.renderActions(toast)}
			</div>
		)
	}
}





