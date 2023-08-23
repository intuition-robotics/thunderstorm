import * as React from 'react';
import {_setTimeout} from '@intuitionrobotics/ts-common/utils/date-time-tools';

type Props = {
	src: string
	onLoaded: (src: string) => void
}

export class SimpleScriptInjector
	extends React.Component<Props> {

	static readonly injected: { [src: string]: HTMLScriptElement } = {};

	componentDidMount(): void {
		if (SimpleScriptInjector.injected[this.props.src]) {
			_setTimeout(() => this.props.onLoaded(this.props.src));
			return;
		}

		const script: HTMLScriptElement = document.createElement("script");
		script.type = "text/javascript";
		script.src = this.props.src;
		script.async = true;
		script.id = this.props.src;
		script.onload = () => this.props.onLoaded(this.props.src);
		document.body.appendChild(script);
		SimpleScriptInjector.injected[this.props.src] = script;
	}

	render() {
		return "";
	}
}
