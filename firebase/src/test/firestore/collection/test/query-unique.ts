import {__scenario} from "@intuitionrobotics/testelot";
import {assert} from "@intuitionrobotics/ts-common/utils/object-tools";
import {FirestoreQuery} from "../../../../main/shared/types";
import {
    testCollection,
    testInstance1,
    testInstance2,
    testInstance3,
    testInstance4,
    testInstance5,
    testNumber2,
    testString1,
    testString3,
    testString4
} from "../_core/consts";
import {FB_Type, Query_TestCase,} from "../_core/types";

type QueryUnique_TestCase = Query_TestCase<FB_Type>

const allItems = [
    testInstance1,
    testInstance2,
    testInstance3,
    testInstance4,
    testInstance5
];

function queryUnique(label: string, expected: Partial<FB_Type>, query: FirestoreQuery<FB_Type>) {
    // const label1 = `${label}\\n - Query: ${JSON.stringify(query)}`;
    return testCollection.processDirty(label, async (collection) => {
        const item = await collection.queryUnique(query);
        assert("Objects do not match", expected, item);
    });
}


const queryTests: QueryUnique_TestCase[] = [
    {
        insert: allItems,
        label: "Unique Query - number",
        where: {numeric: testNumber2},
        expected: testInstance2
    },
    {
        label: "Unique Query - string",
        where: {stringValue: testString3},
        expected: testInstance3
    },
    {
        label: "Unique Query - boolean",
        where: {booleanValue: testInstance4.booleanValue},
        expected: testInstance4
    },
    {
        label: "Unique Query - boolean & string",
        where: {booleanValue: testInstance4.booleanValue, stringValue: testString4},
        expected: testInstance4
    },
    {
        insert: [testInstance1, testInstance1],
        label: "Query Limit 1",
        where: {stringValue: testString1},
        limit: 1,
        expected: testInstance1
    },
];

export const scenarioQueryUnique = __scenario("Query Unique");
for (const queryTest of queryTests) {
    const instances = queryTest.insert;
    if (instances)
        scenarioQueryUnique.add(testCollection.processClean("Populate db with items", async (collection) => {
            await collection.insertAll(instances);
        }));

    scenarioQueryUnique.add(queryUnique(queryTest.label, queryTest.expected, queryTest));
}
