import {ThunderDispatcher} from "./thunder-dispatcher";
import {OnRequestListener} from "../../shared/request-types";
import {ModuleManager} from "@intuitionrobotics/ts-common/core/module-manager";

export class AbstractThunder
	extends ModuleManager {

	constructor() {
		super();
		this._DEBUG_FLAG.enable(false);
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

	public build(onStarted?: () => void) {
		super.build()
		onStarted?.();
	}

	protected renderApp = (): void => {
		// Stub
	};
}

export const dispatch_requestCompleted = new ThunderDispatcher<OnRequestListener, "__onRequestCompleted">("__onRequestCompleted");
