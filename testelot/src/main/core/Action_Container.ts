import {
	Action,
	ErrorPolicy,
	Status
} from "./Action";

import {
	ContextKey,
	TypedHashMap
} from "./ContainerContext";

export abstract class Action_Container
	extends Action {

	protected context: TypedHashMap = new TypedHashMap();

	private readonly actions: Action<any>[] = [];
	private isProxy: boolean = false;

	protected constructor(type: Function, tag?: string) {
		super(type, tag);
	}

	isContainer(): boolean {
		return true;
	}

	public add(...steps: Action<any>[]) {
		this.actions.push(...steps);
		return this;
	}

	public setProxy(isProxy: boolean) {
		this.isProxy = isProxy;
		return this;
	}

	public get<ValueType>(key: ContextKey<ValueType>): ValueType | undefined {
		if (this.isProxy)
			return super.get(key);

		const value = this.context.get(key);
		if (value)
			return value;

		return super.get(key);
	}

	protected remove<ValueType>(key: ContextKey<ValueType>): boolean {
		if (this.isProxy)
			return super.remove(key);

		const value = this.context.delete(key);
		if (value)
			return value;

		return super.remove(key);
	}

	public set<ValueType>(key: ContextKey<ValueType>, value: ValueType): ValueType | undefined {
		if (this.isProxy)
			return super.set(key, value);

		this.logDebug(`  Storing: ${key.key} => ${JSON.stringify(value)}`);
		const prevValue = this.context.get(key);
		this.context.set(key, value);
		return prevValue;
	}

	protected getSteps() {
		return this.actions;
	}

	public reset() {
		this.context.clear();
		super.reset();

		this.actions.forEach(action => action.reset());
	}

	protected async execute() {
		for (const action of this.actions) {
			if (this.status !== Status.Running)
				action.setStatus(Status.Skipped);

			await this._executeSubAction(action);
			if (action.status !== Status.Error)
				continue;

			// noinspection FallThroughInSwitchStatementJS
			switch (action.policy) {
				case ErrorPolicy.ContinueOnError:
					continue;

				case ErrorPolicy.HaltOnError:
					this.setErrorPolicy(ErrorPolicy.SkipOnError);
					this.setStatus(Status.Error);

				case ErrorPolicy.SkipOnError:
					this.setStatus(Status.Skipped);
					break;
			}
		}
	}

	public isEmpty(): boolean {
		return this.actions && this.actions.length === 0;
	}
}
