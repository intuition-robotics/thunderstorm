
import * as React from "react";
import {
	Toast_Model,
	ToastListener,
	ToastModule
} from "./ToasterModule";
import {BaseComponent} from "../../core/BaseComponent";

type State = { model?: Toast_Model };

export type ToastProps = {
	id?: string
}

export abstract class BaseToaster
	extends BaseComponent<ToastProps, State>
	implements ToastListener {

	protected constructor(props: ToastProps) {
		super(props);
		this.state = {};
	}

	__showToast = (model?: Toast_Model): void => {
		this.setState({model});
		if (!model)
			return;

		const duration = model.duration;
		if (duration <= 0)
			return;

		this.debounce(() => ToastModule.hideToast(model), 'closing_action', duration);
	};

	render() {
		const toast = this.state.model;
		if (!toast?.content)
			return null;

		return this.renderToaster(toast);
	}

	renderActions = (toast: Toast_Model) => {
		if (!toast.actions || toast.actions.length === 0)
			return <button onClick={() => ToastModule.hideToast(toast)}>X</button>;

		return <div className={'ll_v_l'}>{React.Children.map(toast.actions, (action, idx) =>
			React.cloneElement(action, {key: idx})
		)}</div>;
	};

	protected abstract renderToaster(toast: Toast_Model): React.ReactNode ;
}





