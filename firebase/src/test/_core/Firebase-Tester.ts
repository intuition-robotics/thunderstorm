import * as fs from "fs";

import {
	__scenario,
	Action,
	Reporter,
	Scenario
} from "@intuitionrobotics/testelot";
import { ModuleManager } from "@intuitionrobotics/ts-common/core/module-manager";
import {FirebaseModule, FirebaseModule_Class} from "../../main/app-backend/FirebaseModule";
import { ImplementationMissingException } from "@intuitionrobotics/ts-common/core/exceptions";



export class FirebaseTester
	extends ModuleManager {
	private scenario!: Scenario;
	private reporter = new Reporter();

	constructor() {
		super();
	}

	init() {
		super.init();
		return this;
	}

	setScenario(scenario: Scenario) {
		this.scenario = scenario;
		return this;
	}

	build() {
		const pwd = process.env.PWD;
		let packageName: string;
		if (pwd)
			packageName = pwd.substring(pwd.lastIndexOf("/") + 1);

		this.runTestsImpl()
		    .then(() => {
			    const errorCount = this.reporter.summary.Error;
			    if (errorCount > 0) {
				    this.logError(`Package: ${packageName} - Tests ended with ${errorCount} ${errorCount === 1 ? "error" : "errors"}`);
				    process.exit(2);
			    }

			    this.logInfo(`Package: ${packageName} - Tests completed successfully`)
			    process.exit(0);
		    })
		    .catch(reason => {
			    this.logError(`Package: ${packageName} - Tests failed`, reason);
			    process.exit(3);
		    });
	}

	prepare = () => {
		FirebaseModule_Class.localAdminConfigId = "test-permissions";

		const serviceAccount = this.resolveServiceAccount();
		FirebaseModule.setDefaultConfig({"test-permissions": serviceAccount});
	};

	private runTestsImpl = async () => {
		if (!this.scenario)
			throw new ImplementationMissingException("No test specified!!");

		this.prepare();
		this.init();
		this.reporter.init();

		Action.resolveTestsToRun()
		const scenario = __scenario("root", this.reporter);
		scenario.add(this.scenario);
		await scenario.run();
	};

	private resolveServiceAccount() {
		let pathToServiceAccount = process.env.npm_config_service_account || process.argv.find((arg: string) => arg.startsWith("--service-account="));
		if (!pathToServiceAccount)
			throw new ImplementationMissingException("could not find path to service account!!!");

		pathToServiceAccount = pathToServiceAccount.replace("--service-account=", "");
		return JSON.parse(fs.readFileSync(pathToServiceAccount, "utf8"))
	}
}
