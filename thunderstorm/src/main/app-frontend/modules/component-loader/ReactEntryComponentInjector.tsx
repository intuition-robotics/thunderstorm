import * as React from 'react';
import {EntryComponentLoadingModule} from "./entry-component-loading-module";
import {BaseComponent} from "../../core/BaseComponent";
import {OnRequestListener} from '../../../shared/request-types';

export type LoaderProps = { progress: number };

type Props = {
	loader?: React.ElementType<LoaderProps>;
	src: string;
}

type State = {
	loading: boolean;
	progress: number;
}

export class ReactEntryComponentInjector
	extends BaseComponent<Props, State>
	implements OnRequestListener {

	private myRef: React.RefObject<HTMLDivElement> = React.createRef();

	constructor(props: Props) {
		super(props);
		this.state = {loading: false, progress: 0};
	}

	__onRequestCompleted = (key: string, success: boolean) => {
		if (key !== this.props.src)
			return;

		if (!success)
		// Need to add error handling here...
			return;

		this.injectComponent(EntryComponentLoadingModule.getNode(key));
	};

	private injectComponent(node: Node) {
		this.myRef.current?.appendChild(node);
		this.setState({loading: false});
	}

	componentDidMount(): void {
		const src = this.props.src;
		const node = EntryComponentLoadingModule.getNode(src);
		if (node)
			return this.injectComponent(node);

		EntryComponentLoadingModule.loadScript(src, (progress) => this.setState({progress}));
		this.setState({loading: true});
	}

	render() {
		return <div ref={this.myRef} id={this.props.src}>{this.extracted()}</div>;
	}

	private extracted() {
		const Loader = this.props.loader;
		if (Loader)
			return <Loader progress={this.state.progress}/>;

		return <div style={{width: "100%", height: "100%"}}>{this.state.progress} %</div>;
	}
}
