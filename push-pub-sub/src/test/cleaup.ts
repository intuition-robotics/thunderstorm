import { FirestoreTransaction } from "@intuitionrobotics/firebase/app-backend/firestore/FirestoreTransaction";
import {__custom, __scenario} from "@intuitionrobotics/testelot";
import { currentTimeMillies, Hour } from "@intuitionrobotics/ts-common/utils/date-time-tools";
import {assert, compare } from "@intuitionrobotics/ts-common/utils/object-tools";
import { generateHex } from "@intuitionrobotics/ts-common/utils/random-tools";
import {PushPubSubModule} from "../main/app-backend/modules/PushPubSubModule";
import {DB_PushKeys, DB_PushSession, Request_PushRegister } from "../main/shared/types";

const arrayOf2 = Array(2).fill(0);
export const scenarioCleanup = __scenario("Scheduled Cleaup");

const testRegister = async function (request: Request_PushRegister, timestamp: number) {
    const session: DB_PushSession = {
        pushSessionId: 'abc',
        firebaseToken: request.firebaseToken,
        timestamp,
        userId: 'fake-user'
    };

    // @ts-ignore
    await PushPubSubModule.pushSessions.upsert(session);

    const subscriptions = request.subscriptions.map((s): DB_PushKeys => ({
        pushSessionId: request.pushSessionId,
        pushKey: s.pushKey,
        props: s.props
    }));

    // @ts-ignore
    const pushKeysCollection: FirestoreCollection<DB_PushKeys> = PushPubSubModule.pushKeys;

    return pushKeysCollection.runInTransaction(async (transaction: FirestoreTransaction) => {
        const data: DB_PushKeys[] = await transaction.query<DB_PushKeys>(pushKeysCollection, {where: {pushSessionId: request.pushSessionId}});
        const toInsert = subscriptions.filter(s => !data.find((d: DB_PushKeys) => compare(d, s)));
        return Promise.all(toInsert.map(instance => transaction.insert(pushKeysCollection, instance)));
    });
};

const processClean = __custom(async () => {
    // @ts-ignore
    const asyncs: Promise<any>[] = [PushPubSubModule.pushKeys.deleteAll(), PushPubSubModule.pushSessions.deleteAll()];
    await Promise.all(asyncs);
}).setLabel('Start Clean');

const populate = (timestamp: number) => __custom(async () => {
    for (const i in arrayOf2) {
        const instance = {
            pushSessionId: generateHex(8),
            firebaseToken: generateHex(8),
            subscriptions: arrayOf2.map((_e, _i) => ({pushKey: generateHex(8), props: {a: _i}}))
        };
        await testRegister(instance, timestamp);
    }
}).setLabel('Populate');

const cleaup = __custom(async () => PushPubSubModule.scheduledCleanup()).setLabel('Cleaning up');

const check = __custom(async () => {
    // @ts-ignore
    const docs = await PushPubSubModule.pushSessions.query({where: {timestamp: {$lt: currentTimeMillies() - Hour}}});
    assert(`There shouldn't be any docs`, docs.length, 0);
}).setLabel('Checking clean');

scenarioCleanup.add(processClean);
scenarioCleanup.add(populate(currentTimeMillies() - 2 * Hour));
scenarioCleanup.add(populate(currentTimeMillies() + 2 * Hour));
scenarioCleanup.add(cleaup);
scenarioCleanup.add(check);
