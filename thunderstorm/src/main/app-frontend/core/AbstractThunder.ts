import {ThunderDispatcher} from "./thunder-dispatcher";
import {OnRequestListener} from "../../shared/request-types";
import {ModuleManager} from "@intuitionrobotics/ts-common/core/module-manager";
import {removeItemFromArray} from "@intuitionrobotics/ts-common/utils/array-tools";

export class AbstractThunder
	extends ModuleManager {

	protected listeners: any[] = [];

	constructor() {
		super();
		this._DEBUG_FLAG.enable(false);
		// @ts-ignore
		ThunderDispatcher.listenersResolver = () => this.listeners;
	}

	static getInstance(): AbstractThunder {
		return AbstractThunder.instance as AbstractThunder;
	}

	init() {
		super.init();

		this.renderApp();
		return this;
	}

	setRenderApp(renderApp: () => void) {
		this.renderApp = renderApp;
		return this;
	}

	protected addUIListener(listener: any): void {
		this.logInfo(`Register UI listener: ${listener}`);
		this.listeners.push(listener);
	}

	protected removeUIListener(listener: any): void {
		this.logInfo(`Unregister UI listener: ${listener}`);
		removeItemFromArray(this.listeners, listener);
	}

	public build(onStarted?: () => void) {
		super.build()
		onStarted?.();
	}

	protected renderApp = (): void => {
		// Stub
	};
}

export const dispatch_requestCompleted = new ThunderDispatcher<OnRequestListener, "__onRequestCompleted">("__onRequestCompleted");
