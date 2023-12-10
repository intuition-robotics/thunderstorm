import {Module} from "./module";
import {Dispatcher} from "./dispatcher";
import {BadImplementationException} from "./exceptions";
import {Logger} from "./logger/Logger";
import {
	addItemToArray,
	filterDuplicates
} from "../utils/array-tools";
import {ObjectTS} from "../utils/types";

const _modules: Module[] = [];

export function moduleResolver() {
	return _modules;
}

export class ModuleManager
	extends Logger {

	protected config?: ObjectTS;
	protected modules: Module[] = _modules;
	public static instance: ModuleManager;

	// noinspection JSUnusedLocalSymbols
	protected constructor() {
		super();
		if (ModuleManager.instance)
			throw new BadImplementationException("Already have one instance of ModuleManager");

		ModuleManager.instance = this;
		Dispatcher.modulesResolver = moduleResolver;
	}

	filterModules<T>(filter: (module: any) => boolean) {
		return this.modules.filter(filter) as unknown as T[];
	}

	getModule<T>(moduleName: string) {
		return this.modules.find(module => module.getName() === moduleName) as unknown as T;
	}

	public setConfig(config: object) {
		this.config = config || {};
		return this;
	}

	public addModules(...modules: Module[]) {
		modules.reduce((carry: Module[], module: Module) => {
			if (!carry.includes(module))
				addItemToArray(carry, module);

			return carry
		}, this.modules);
		return this;
	}

	public setModules(...modules: Module[]) {
		this.modules = filterDuplicates(modules);
		return this;
	}

	public init(): this {
		this.logInfo(`---------  initializing app  ---------`);
		this.modules.forEach((module: Module) => {
			module.setManager(this);

			if (this.config)
				module.setConfig(this.config[module.getName()]);
		});

		this.modules.forEach(module => {
			this.logInfo(`---------  ${module.getName()}  ---------`);
			// @ts-ignore
			module.init();
			// @ts-ignore
			module.initiated = true;
		});

		this.modules.forEach(module => module.validate());

		this.logInfo(`---------  INITIALIZED  ---------`);
		return this;
	}

	build() {
		this.init();
	}
}
