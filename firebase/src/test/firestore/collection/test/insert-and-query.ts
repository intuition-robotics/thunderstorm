import {
	__scenario,
	Scenario
} from "@intuitionrobotics/testelot";
import { BadImplementationException } from "@intuitionrobotics/ts-common/core/exceptions";
import { sortArray } from "@intuitionrobotics/ts-common/utils/array-tools";
import { assert } from "@intuitionrobotics/ts-common/utils/object-tools";
import { FirestoreCollection } from "../../../../main/app-backend/firestore/FirestoreCollection";
import {
	simpleTypeCollection,
	testCollection,
	testInstance1,
	testInstance2,
	testInstance3,
	testInstance4,
	testInstance5
} from "../_core/consts";
import {
	FB_Type,
	SimpleType
} from "../_core/types";


function testInsert(scenario: Scenario, processor: (collection: FirestoreCollection<FB_Type>, ...items: FB_Type[]) => Promise<any>) {
	scenario.add(testCollection.processClean("Insert and query - one item", async (collection) => {
		await processor(collection, testInstance1);

		const items = await collection.getAll();

		assert("Expected only one item", items.length, 1);
		assert("Inserted object and queried object don't match", items[0], testInstance1);
	}));

	scenario.add(testCollection.processClean("Insert and query unique - one item", async (collection) => {
		await processor(collection, testInstance1);

		const item = await collection.getAll();
		assert("inserted object and queried object don't match", item, [testInstance1]);
	}));

	scenario.add(testCollection.processClean("Insert and query unique - two items - fail with: too many result", async (collection) => {
		await processor(collection, testInstance1, testInstance2);

		await collection.getAll();
	}).expectToFail(BadImplementationException, (e: Error) => e.message.toLowerCase().startsWith("too many results")));

	scenario.add(testCollection.processClean("Insert and query - five items", async (collection) => {
		const _items = [testInstance1, testInstance2, testInstance3, testInstance4, testInstance5];
		await processor(collection, ..._items);

		const items = sortArray(await collection.getAll(), (item: FB_Type) => item.numeric, true);
		assert("Injected and queried objects do not match", _items, items);
	}));

	scenario.add(testCollection.processClean("Insert and query - two same items", async (collection) => {
		await processor(collection, testInstance1, testInstance1);
		const items = await collection.getAll();

		assert("Expected exactly two items item", items.length, 2);
		assert("Injected and queried[0] do not match", testInstance1, items[0]);
		assert("Injected and queried[1] do not match", testInstance1, items[1]);
	}));
}

export const scenarioInsert = __scenario("Insert & Query");
testInsert(scenarioInsert, async (collection, ...items: FB_Type[]) => {
	for (const item of items) {
		await collection.insert(item)
	}
});

export const scenarioInsertAll = __scenario("Insert All & Query");
testInsert(scenarioInsertAll, async (collection, ...items: FB_Type[]) => {
	return collection.insertAll(items)
});
