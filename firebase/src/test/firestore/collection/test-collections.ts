import {__scenario} from "@intuitionrobotics/testelot";
import {scenarioInsert, scenarioInsertAll} from "./test/insert-and-query";
import {scenarioQueryUnique} from "./test/query-unique";
import {scenarioQuery} from "./test/query";
import {scenarioCollectionPatch} from "./test/patch";
import {scenarioCollectionDelete} from "./test/delete";
import {scenarioCollectionDeleteInTransaction} from "./test/delete-in-transaction";

export const testCollections = __scenario("test-collections");
testCollections.add(scenarioCollectionPatch);
testCollections.add(scenarioCollectionDelete);
testCollections.add(scenarioCollectionDeleteInTransaction);
testCollections.add(scenarioInsert);
testCollections.add(scenarioInsertAll);
testCollections.add(scenarioQueryUnique);
testCollections.add(scenarioQuery);
