
import {LogClient_BaseRotate} from "./LogClient_BaseRotate";


export class LogClient_MemBuffer
	extends LogClient_BaseRotate {

	readonly buffers: string[] = [""];

	constructor(name: string, maxEntries = 10, maxSize = 1024 * 1024) {
		super(name, maxEntries, maxSize);
	}

	protected printLogMessage(log: string) {
		this.buffers[0] += log;
	}

	protected cleanup(): void {
	}

	protected rotateBuffer(fromIndex: number, toIndex: number): void {
		this.buffers[toIndex] = this.buffers[fromIndex];
	}

	protected prepare(): void {
		this.buffers[0] = "";
	}
}
