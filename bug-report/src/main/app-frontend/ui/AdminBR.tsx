
import * as React from "react";
import {
	AdminBRModule,
	RequestKey_GetLog
} from "../modules/AdminBRModule";
import {BaseComponent,} from "@intuitionrobotics/thunderstorm/frontend";
import {DB_BugReport} from "../../shared/api";
import {__stringify} from "@intuitionrobotics/ts-common";
import {OnRequestListener} from "@intuitionrobotics/thunderstorm";

export class AdminBR
	extends BaseComponent
	implements OnRequestListener {

	render() {
		const logs = AdminBRModule.getLogs();
		return (
			<div>
				<button onClick={AdminBRModule.retrieveLogs}>click to display logs</button>
				<div>
					<table style={{width: "100%"}}>{logs.map(this.createRow)}</table>
				</div>
			</div>
		);
	}

	private createRow = (report: DB_BugReport) => <tr>
		<td style={{padding: "15px", textAlign: "left", border: "1px solid #ddd", fontSize: "15px"}}>{report.description}</td>
		<td style={{padding: "15px", textAlign: "left", border: "1px solid #ddd", fontSize: "15px"}}>{report.reports[0].path}</td>
		<td style={{padding: "15px", textAlign: "left", border: "1px solid #ddd", fontSize: "15px"}}>{__stringify(report.tickets)}</td>
		<td style={{padding: "15px", textAlign: "left", border: "1px solid #ddd", fontSize: "15px"}}>
			<button onClick={() => AdminBRModule.downloadMultiLogs(report.reports)}>download</button>
		</td>
	</tr>;

	__onRequestCompleted = (key: string, success: boolean) => {
		switch (key) {
			default:
				return;

			case RequestKey_GetLog:
				this.forceUpdate();
		}
	};
}
