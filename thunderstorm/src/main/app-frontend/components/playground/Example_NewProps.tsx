import * as React from "react";

type Props<P> = {
	name: string
	renderer: React.ComponentType<P>
	data: P[]
	showList?: boolean
	showToggle?: boolean
};

type State = { index: number };
type InferProps<T> = T extends React.ComponentType<infer P> ? P : "blah blah";

export class Example_NewProps<T, P = InferProps<T>>
	extends React.Component<Props<P>, State> {

	static defaultProps = {
		showList: true,
		showToggle: true
	};

	constructor(props: Props<P>) {
		super(props);
		this.state = {index: 0};
	}

	render() {
		const Renderer = this.props.renderer;
		return <div>
			<div style={{marginBottom: "10px"}}>{this.props.name}</div>
			{this.renderList(Renderer)}
			{this.renderToggle(Renderer)}
		</div>
	}

	private renderToggle(Renderer: React.ComponentType<P>) {
		if (!this.props.showToggle)
			return;

		return <div>
			<div onClick={() => {
				this.setState(state => {
					let index = state.index + 1;
					if (index >= this.props.data.length)
						index = 0;

					return {index}
				})
			}} style={{width: "fit-content"}}>
				click to switch
			</div>
			<Renderer {...this.props.data[this.state.index]}/>
		</div>;
	}

	private renderList(Renderer: React.ComponentType<P>) {
		if (!this.props.showList)
			return;

		return <div className="ll_v_l" style={{marginBottom: "20px"}}>
			{this.props.data.map((_data, index) => <div key={index} style={{marginBottom: "5px"}}><Renderer {..._data}/></div>)}
		</div>;
	}
}
