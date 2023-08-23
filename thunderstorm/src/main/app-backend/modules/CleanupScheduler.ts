
import {FirebaseScheduledFunction} from "@intuitionrobotics/firebase/app-backend/functions/firebase-function";
import {FirebaseModule} from "@intuitionrobotics/firebase/app-backend/FirebaseModule";
import { Dispatcher } from "@intuitionrobotics/ts-common/core/dispatcher";
import { currentTimeMillies } from "@intuitionrobotics/ts-common/utils/date-time-tools";

export type ActDetailsDoc = {
	timestamp: number,
	moduleKey: string
}

export type CleanupDetails = {
	cleanup: () => Promise<void>,
	interval: number,
	moduleKey: string
}

export interface OnCleanupSchedulerAct {
	__onCleanupSchedulerAct: () => CleanupDetails
}

const dispatch_onCleanupSchedulerAct = new Dispatcher<OnCleanupSchedulerAct, "__onCleanupSchedulerAct">("__onCleanupSchedulerAct");

export class CleanupScheduler_Class
	extends FirebaseScheduledFunction {

	constructor() {
		super("CleanupScheduler");
		this.setSchedule('every 1 hours');
	}

	onScheduledEvent = async (): Promise<any> => {
		const cleanupStatusCollection = FirebaseModule.createAdminSession().getFirestore().getCollection<ActDetailsDoc>('cleanup-status', ["moduleKey"]);
		const cleanups = dispatch_onCleanupSchedulerAct.dispatchModule([]);
		await Promise.all(cleanups.map(async cleanupItem => {
			const doc = await cleanupStatusCollection.queryUnique({where: {moduleKey: cleanupItem.moduleKey}});
			if (doc && doc.timestamp + cleanupItem.interval > currentTimeMillies())
				return;

			try {
				await cleanupItem.cleanup();
				await cleanupStatusCollection.upsert({timestamp: currentTimeMillies(), moduleKey: cleanupItem.moduleKey});
			} catch (e) {
				this.logWarning(`cleanup of ${cleanupItem.moduleKey} has failed with error '${e}'`);
			}
		}));
	};
}

export const CleanupScheduler = new CleanupScheduler_Class();
