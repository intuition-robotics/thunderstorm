import {Action, Status} from "./Action";

import {LogLevel, LogParam} from "@intuitionrobotics/ts-common/core/logger/types";

import {BeLogged} from "@intuitionrobotics/ts-common/core/logger/BeLogged";
import {
    _logger_convertLogParamsToStrings,
    _logger_indentNewLineBy,
} from "@intuitionrobotics/ts-common/core/logger/utils";

import {Logger} from "@intuitionrobotics/ts-common/core/logger/Logger";
import {LogClient_Terminal, NoColor,} from "@intuitionrobotics/ts-common/core/logger/LogClient_Terminal";
import {DefaultLogPrefixComposer, LogClient} from "@intuitionrobotics/ts-common/core/logger/LogClient";

class ReportSummary {
    Running: number = 0;
    Skipped: number = 0;
    Success: number = 0;
    Error: number = 0;
}

export class Reporter
    extends Logger {

    private readonly reports: { [key: string]: ActionReport } = {};
    public readonly summary: ReportSummary = new ReportSummary();

    private report!: ActionReport;

    private reporter = new ReporterLogClient(this);

    constructor() {
        super("Testelot");
        BeLogged.addClient(this.reporter);
    }

    init() {
    }

    logMessage(logMessage: string) {
        if (this.report)
            this.report.appendLog(logMessage);
    }

    onActionStarted(action: Action<any>) {
        this.reports[action.uuid] = this.report = new ActionReport(action);
        // if (action.isContainer())
        this.reporter.onContainerStarted();
    }

    onActionEnded(action: Action<any>) {
        switch (action.status) {
            case Status.Ready:
            case Status.Running:
                this.logWarning(`action state: ${action.status} found in action ended event`)
                break;

            case Status.Skipped:
            case Status.Success:
            case Status.Error:
                this.reporter.onContainerEnded();
                if (action.isContainer()) {
                    return;
                }

                this.summary[action.status]++;
                break;
        }
    }
}


export class ActionReport {
    constructor(action: Action) {
        this.action = action
    }

    readonly action: Action;
    private logs: string = "";

    getLog() {
        return this.logs;
    }

    appendLog(logMessage: string) {
        this.logs += `${logMessage}\n`;
    }
}

function pad(value: number, length: number) {
    let s = "" + value;
    while (s.length < (length || 2)) {
        s = "0" + s;
    }
    return s;
}

class ReporterLogClient
    extends LogClient {
    private report: Reporter;
    private indent: string = "";
    private static indent: string = "  ";

    constructor(report: Reporter) {
        super();
        this.report = report;
        this.setComposer(this.composer);
    }

    private composer = (tag: string, level: LogLevel): string => {
        const successPart = `\x1b[32m${pad(this.report.summary.Success, 3)}${NoColor}`;
        const skippedPart = `\x1b[90m\x1b[1m${pad(this.report.summary.Skipped, 3)}${NoColor}`;
        const errorPart = `\x1b[31m${pad(this.report.summary.Error, 3)}${NoColor}`;
        const status = `${errorPart}/${skippedPart}/${successPart}`;

        const defaultPrefix = DefaultLogPrefixComposer("Testelot", level);

        const color = LogClient_Terminal.getColor(level);

        return ` ${defaultPrefix} ${NoColor}[${status}]:${color} ${this.indent}`;
    }

    protected logMessage(level: LogLevel, bold: boolean, prefix: string, toLog: LogParam[]): void {
        const color = LogClient_Terminal.getColor(level, bold);
        const paramsAsStrings = _logger_convertLogParamsToStrings(toLog);
        paramsAsStrings.forEach(str => console.log(_logger_indentNewLineBy(color + prefix, str), NoColor))
    }

    onContainerStarted() {
        this.indent += ReporterLogClient.indent;
    }

    onContainerEnded() {
        this.indent = this.indent.substring(0, this.indent.length - ReporterLogClient.indent.length);
        return;
    }
}
