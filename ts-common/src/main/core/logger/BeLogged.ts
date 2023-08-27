

import {LogClient} from "./LogClient";
import {removeItemFromArray} from "../../utils/array-tools";
import {
	LogLevel,
	LogParam
} from "./types";

class BeLogged_Class {

	private clients: LogClient[] = [];
	private lineCount = 0;

	public addClient<Client extends LogClient>(client: Client) {
		if (this.clients.indexOf(client) !== -1)
			return;

		this.clients.push(client);
	}

	public removeConsole<Client extends LogClient>(client: Client) {
		if (this.clients.indexOf(client) === -1)
			return;

		removeItemFromArray(this.clients, client);
	}

	public log(tag: string, level: LogLevel, bold: boolean, ...toLog: LogParam[]): void {
		this.logImpl(tag, level, bold, toLog);
	}

	private logImpl(tag: string, level: LogLevel, bold: boolean, toLog: LogParam[]): void {
		for (const client of this.clients) {
			client.log(tag, level, bold, toLog);
		}
	}


	public clearFooter() {
		for (let i = 0; i < this.lineCount + 3; i++) {
			process.stdout.write(`\n`);
		}
	}

	public rewriteConsole(lineCount: number) {
		this.lineCount = lineCount;
	}
}

export const BeLogged = new BeLogged_Class();

