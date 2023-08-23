import {Module} from "@intuitionrobotics/ts-common/core/module";
import {padNumber} from "@intuitionrobotics/ts-common/utils/string-tools";
import {BugReport, DB_BugReport, ReportLogFile, Request_BugReport} from "../../shared/api";
import {FirebaseModule} from "@intuitionrobotics/firebase/app-backend/FirebaseModule";
import {FirestoreCollection} from "@intuitionrobotics/firebase/app-backend/firestore/FirestoreCollection";
import {StorageWrapper} from "@intuitionrobotics/firebase/app-backend/storage/StorageWrapper";
import * as JSZip from "jszip";
import {auditBy} from "@intuitionrobotics/ts-common/utils/date-time-tools";
import {generateHex} from "@intuitionrobotics/ts-common/utils/random-tools";
import {filterInstances} from "@intuitionrobotics/ts-common/utils/array-tools";

export type TicketDetails = {
    platform: string
    issueId: string
}
type Config = {
    projectId?: string,
    bucket?: string,
}
type TicketCreatorApi = (bugReport: Request_BugReport, logs: ReportLogFile[], email?: string) => Promise<TicketDetails | undefined>;

export class BugReportModule_Class
    extends Module<Config> {

    constructor() {
        super("BugReportModule");
    }

    private bugReport!: FirestoreCollection<DB_BugReport>;
    private storage!: StorageWrapper;
    private ticketCreatorApis: TicketCreatorApi[] = [];

    protected init(): void {
        const sessionAdmin = FirebaseModule.createAdminSession();
        const firestore = sessionAdmin.getFirestore();
        this.bugReport = firestore.getCollection<DB_BugReport>('bug-report', ["_id"]);
        this.storage = sessionAdmin.getStorage();
    }

    addTicketCreator(ticketCreator: TicketCreatorApi) {
        this.ticketCreatorApis.push(ticketCreator)
    }

    saveLog = async (report: BugReport, id: string): Promise<ReportLogFile> => {
        const zip = new JSZip();

        report.log.forEach((message, i) => zip.file(`${report.name}_${padNumber(i, 2)}.txt`, message));

        const buffer = await zip.generateAsync({type: "nodebuffer"});
        const bucket = await this.storage.getOrCreateBucket(this.config?.bucket);
        const fileName = `${id}-${report.name}.zip`;
        const file = await bucket.getFile(fileName);
        await file.write(buffer);
        return {
            path: `https://storage.cloud.google.com/${file.file.metadata.bucket}/${file.file.metadata.name}`,
            name: fileName
        };
    };

    saveFile = async (bugReport: Request_BugReport, email?: string) => {

        const _id = generateHex(16);
        const logs: ReportLogFile[] = await Promise.all(bugReport.reports.map(report => this.saveLog(report, _id)));

        const instance: DB_BugReport = {
            _id,
            subject: bugReport.subject,
            description: bugReport.description,
            reports: logs,
            _audit: auditBy(email || "bug-report"),
        };

        if (this.config?.bucket)
            instance.bucket = this.config.bucket;

        const tickets = await Promise.all(this.ticketCreatorApis.map(api => api(bugReport, logs, email)));
        instance.tickets = filterInstances(tickets)
        await this.bugReport.insert(instance);
        return instance.tickets;
    };
}

export const BugReportModule = new BugReportModule_Class();

