import {FirebaseScheduledFunction} from "@intuitionrobotics/firebase/app-backend/functions/firebase-function";
import {FirebaseModule} from "@intuitionrobotics/firebase/app-backend/FirebaseModule";
import {ActDetailsDoc,} from "./CleanupScheduler";
import {FirestoreCollection} from "@intuitionrobotics/firebase/app-backend/firestore/FirestoreCollection";
import {Dispatcher} from "@intuitionrobotics/ts-common/core/dispatcher";
import {FirestoreQuery} from "@intuitionrobotics/firebase/shared/types";
import {filterInstances} from "@intuitionrobotics/ts-common/utils/array-tools";
import {currentTimeMillies} from "@intuitionrobotics/ts-common/utils/date-time-tools";
import {__stringify} from "@intuitionrobotics/ts-common/utils/tools";
import {_logger_logException} from "@intuitionrobotics/ts-common/core/logger/utils";
import {dispatch_onServerError, ServerErrorSeverity} from "@intuitionrobotics/ts-common/core/error-handling";

export type BackupDoc = ActDetailsDoc & {
    backupPath: string,
}

export type FirestoreBackupDetails<T extends object> = {
    moduleKey: string,
    interval: number,
    keepInterval?: number,
    collection: FirestoreCollection<T>,
    backupQuery: FirestoreQuery<T>
}

export interface OnFirestoreBackupSchedulerAct {
    __onFirestoreBackupSchedulerAct: () => FirestoreBackupDetails<any>[]
}

const dispatch_onFirestoreBackupSchedulerAct = new Dispatcher<OnFirestoreBackupSchedulerAct, "__onFirestoreBackupSchedulerAct">(
    "__onFirestoreBackupSchedulerAct");

export class FirestoreBackupScheduler_Class
    extends FirebaseScheduledFunction {

    constructor() {
        super("FirestoreBackupScheduler");
        this.setSchedule('every 24 hours');
    }

    onScheduledEvent = async (): Promise<any> => {
        const backupStatusCollection = FirebaseModule.createAdminSession().getFirestore().getCollection<BackupDoc>('firestore-backup-status',
            ["moduleKey", "timestamp"]);
        const backups: FirestoreBackupDetails<any>[] = [];
        filterInstances(dispatch_onFirestoreBackupSchedulerAct.dispatchModule([])).forEach(backupArray => {
            backups.push(...backupArray);
        });

        const bucket = await FirebaseModule.createAdminSession().getStorage().getOrCreateBucket();
        await Promise.all(backups.map(async (backupItem) => {
            const query: FirestoreQuery<BackupDoc> = {
                where: {moduleKey: backupItem.moduleKey},
                orderBy: [{key: "timestamp", order: "asc"}],
                limit: 1
            };
            const docs = await backupStatusCollection.query(query);
            const latestDoc = docs[0];
            if (latestDoc && latestDoc.timestamp + backupItem.interval > currentTimeMillies())
                return;

            const backupPath = `backup/firestore/${backupItem.moduleKey}/${currentTimeMillies()}.json`;
            try {
                const toBackupData = await backupItem.collection.query(backupItem.backupQuery);
                await (await bucket.getFile(backupPath)).write(toBackupData);
                await backupStatusCollection.upsert({
                    timestamp: currentTimeMillies(),
                    moduleKey: backupItem.moduleKey,
                    backupPath
                });

                const keepInterval = backupItem.keepInterval;
                if (keepInterval) {
                    const queryOld = {
                        where: {
                            moduleKey: backupItem.moduleKey,
                            timestamp: {$lt: currentTimeMillies() - keepInterval}
                        }
                    };
                    const oldDocs = await backupStatusCollection.query(queryOld);
                    await Promise.all(oldDocs.map(async oldDoc => {
                        await (await bucket.getFile(oldDoc.backupPath)).delete();
                    }));

                    await backupStatusCollection.delete(queryOld);
                }

            } catch (e) {
                this.logWarning(`backup of ${backupItem.moduleKey} has failed with error`, e);
                const errorMessage = `Error backing up firestore collection config:\n ${__stringify(backupItem, true)}\nError: ${_logger_logException(e)}`;

                await dispatch_onServerError.dispatchModuleAsync([ServerErrorSeverity.Critical, this, errorMessage]);

            }
        }));
    };
}

export const FirestoreBackupScheduler = new FirestoreBackupScheduler_Class();
