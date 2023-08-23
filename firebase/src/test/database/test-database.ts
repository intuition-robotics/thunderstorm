import {__scenario} from "@intuitionrobotics/testelot";
import {scenarioAddData} from "./test/add-data";
import {scenarioRemoveData} from "./test/remove-data";


export const testDatabase = __scenario("test-database");
testDatabase.add(scenarioAddData);
testDatabase.add(scenarioRemoveData)
