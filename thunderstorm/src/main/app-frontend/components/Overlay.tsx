import * as React from 'react';
import {CSSProperties} from 'react';

type Props = {
	zIndex: number
	showOverlay: boolean
	onClickOverlay: (event: React.MouseEvent<HTMLDivElement>) => void
};

const overlayStyle = (zIndex: number): CSSProperties => ({
	zIndex,
	position: 'fixed',
	top: 0,
	left: 0,
	right: 0,
	bottom: 0
});
const childrenStyle = (zIndex: number) => ({
	zIndex,
	display: "inline-block"
});

export class Overlay
	extends React.Component<Props> {

	static defaultProps: Partial<Props> = {
		zIndex: 2
	};

	render() {
		if (!this.props.showOverlay)
			return this.props.children;

		return <>
			<div style={childrenStyle(this.props.zIndex + 1)}>
				{this.props.children}
			</div>
			<div
				onClick={event => this.props.onClickOverlay(event)}
				style={overlayStyle(this.props.zIndex)}
			/>
		</>
	}
}
