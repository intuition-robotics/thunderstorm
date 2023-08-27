
import {ApiWithBody, ApiWithQuery} from "@intuitionrobotics/thunderstorm/shared/types";
import {Auditable, DB_Object} from "@intuitionrobotics/ts-common/utils/types";
import {TicketDetails} from "../app-backend/modules/BugReportModule";

export type BugReport = {
    name: string
    log: string[]
}

export const Platform_Jira = "jira";
export const Platform_Slack = "slack";

export type Request_BugReport = {
    subject: string
    description: string
    reports: BugReport[]
    platforms?: string[]
};

export type ReportMetaData = {
    description: string,
    path: string,
    minPath: string
}
export type DB_BugReport = DB_Object & Auditable & {
    subject: string;
    description: string
    reports: ReportLogFile[]
    bucket?: string
    tickets?: TicketDetails[]
};

export type ReportLogFile = {
    name: string
    path: string
}

export type Paths = {
    path: string
}

export type SecuredUrl = {
    fileName: string
    securedUrl: string
    publicUrl: string
}

export type ApiGetLog = ApiWithQuery<string, DB_BugReport[]>
export type ApiPostPath = ApiWithBody<'/v1/bug-reports/download-logs', Paths, SecuredUrl>
export type ApiBugReport = ApiWithBody<'/v1/bug-reports/report', Request_BugReport, TicketDetails[]>
