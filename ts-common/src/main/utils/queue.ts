
import {Logger} from "../core/logger/Logger";
import {addItemToArray, removeItemFromArray} from "./array-tools";

export class Queue
	extends Logger {

	private parallelCount = 1;
	private running = 0;
	private queue: (() => Promise<void>)[] = [];
	private onQueueEmpty?: () => void;
	private finalResolve?: (value?: unknown) => void;

	constructor(name: string) {
		super(name);
	}

	setParallelCount(parallelCount: number) {
		this.parallelCount = parallelCount;
		return this;
	}

	setOnQueueEmpty(onQueueEmpty: () => void) {
		this.onQueueEmpty = onQueueEmpty;
		return this;
	}

	addItem<T>(toExecute: () => Promise<T>, onCompleted?: (output: T) => void, onError?: (error: Error) => void) {
		this.addItemImpl(toExecute.bind(this),onCompleted?.bind(this),onError?.bind(this));

		this.execute();
	}

	addItemImpl<T>(toExecute: () => Promise<T>, onCompleted?: (output: T) => void, onError?: (error: Error) => void) {
		addItemToArray(this.queue, async (resolve: () => void) => {
			this.running++;
			try {
				const output: T = await toExecute();
				onCompleted && onCompleted(output);
			} catch (e) {
				try {
					onError && onError(e);
				} catch (e1) {
					this.logError("Error while calling onError");
					this.logError("--- Original: ", e);
					this.logError("-- Secondary: ", e1);
				}
			}
			this.running--;
			resolve();
			this.execute();
		});
	}

	ignore = () => {
	};

	execute() {
		if (this.queue.length === 0 && this.running === 0) {
			this.onQueueEmpty && this.onQueueEmpty();
			return this.finalResolve?.();
		}

		for (let i = 0; this.running < this.parallelCount && i < this.queue.length; i++) {
			const toExecute = this.queue[0];
			removeItemFromArray(this.queue, toExecute);
			new Promise(toExecute.bind(this))
				.then(this.ignore)
				.catch(this.ignore);
		}
	}

	async executeSync() {
		await new Promise(resolve => {
			this.finalResolve = resolve;
			this.execute();
		});
	}
}
