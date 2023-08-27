
import {ModuleManager} from "./module-manager";

export class Application
	extends ModuleManager {

	constructor() {
		super();
	}

	build(onStarted?: () => Promise<any>) {
		super.build();
		onStarted && onStarted()
			.then((data) => {
				data && this.logInfo("data: ", data);
				this.logInfo("Completed");
			})
			.catch((err) => this.logError("Error", err));
	}
}
