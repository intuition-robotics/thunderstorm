import {CSSProperties} from "react";

export type  Stylable = {
	style?: CSSProperties
	className?: string
}

export class StylableBuilder {
	style?: CSSProperties;
	className?: string;

	setStyle(style: CSSProperties) {
		this.style = style;
		return this;
	}

	clearInlineStyle() {
		this.style = {};
		return this;
	}

	addStyle(style: CSSProperties) {
		if (!this.style)
			return this.setStyle(style);

		this.style = {...this.style, ...style};
		return this;
	}

	setClassName(className: string) {
		this.className = className;
		return this;
	}

	build() {
		const styleable: Stylable = {
			style: this.style,
			className: this.className
		}

		return styleable;
	}
}
