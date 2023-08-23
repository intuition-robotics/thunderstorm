import {__custom, __scenario, ContextKey} from "@intuitionrobotics/testelot";
import {AccessLevelPermissionsDB} from "../../main/app-backend/modules/db-types/managment";
import {cleanup, ConfigDB, setupDatabase, testConfig1, testLevel1, testLevel2} from "./_core";

const contextKey = new ContextKey<ConfigDB>("config-1");


export function createTwoAccessLevels() {
    const scenario = __scenario("Create two access levels");
    scenario.add(cleanup());
    scenario.add(setupDatabase(testConfig1, testLevel1).setWriteKey(contextKey));
    scenario.add(__custom(async (action, data) => {
        await AccessLevelPermissionsDB.upsert({...testLevel2, domainId: data.domain._id});
    }).setReadKey(contextKey).setLabel("Add second access level"));
    return scenario;
}

