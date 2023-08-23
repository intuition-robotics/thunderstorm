import * as React from "react";

export type KeyboardListenerProps = {
	onKeyboardEventListener: (node: HTMLDivElement, e: KeyboardEvent) => void
	className?: string
	onFocus?: () => void
	onBlur?: () => void
	id?: string
}

export class KeyboardListener<P extends KeyboardListenerProps>
	extends React.Component<P> {

	private node?: HTMLDivElement;

	private addKeyboardListener() {
		const onKeyboardEventListener = this.props.onKeyboardEventListener;
		if (!onKeyboardEventListener)
			return;

		this.node?.addEventListener("keydown", this.keyboardEventHandler)
	}

	private removeKeyboardListener() {
		const onKeyboardEventListener = this.props.onKeyboardEventListener;
		if (!onKeyboardEventListener)
			return;

		this.node?.removeEventListener("keydown", this.keyboardEventHandler)
	}

	keyboardEventHandler = (e: KeyboardEvent) => this.node && this.props.onKeyboardEventListener && this.props.onKeyboardEventListener(this.node, e);

	onFocus = () => {
		this.addKeyboardListener();
		this.props.onFocus && this.props.onFocus();
	};

	onBlur = () => {
		this.removeKeyboardListener();
		this.props.onBlur && this.props.onBlur();
	};

	render() {
		return <div
			id={this.props.id ? `${this.props.id}-listener` : ''}
			ref={(node: HTMLDivElement) => {
				if (this.node)
					return;

				this.node = node;
				this.forceUpdate();
			}}
			tabIndex={1}
			onFocus={this.onFocus}
			onBlur={this.onBlur}>
			{this.props.children}
		</div>
	}
}
