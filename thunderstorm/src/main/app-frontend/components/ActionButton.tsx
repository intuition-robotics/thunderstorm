import * as React from "react";

export const ActionButton = (props: { action: string | (() => void), icon: string, classCss?: string|{[key:string]:any} }) => {
	let _action: () => any;
	if (typeof props.action === "string")
		_action = () => window.open(props.action as string, "_blank");
	else
		_action = props.action;
	return <div style={{padding: 5}}>
		<img
			className={`clickable ${typeof props.classCss === "string"? props.classCss:""}`}
			style={typeof props.classCss === "object"?props.classCss:{}}
			src={props.icon}
			onClick={_action}/>
	</div>
};


