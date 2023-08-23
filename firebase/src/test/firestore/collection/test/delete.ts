import {
	testCollectionWithUnique,
	testInstance1,
	testInstance2,
	testInstance3
} from "../_core/consts";
import {__scenario} from "@intuitionrobotics/testelot";
import {FB_Type} from "../_core/types";
import { sortArray } from "@intuitionrobotics/ts-common/utils/array-tools";
import { assert } from "@intuitionrobotics/ts-common/utils/object-tools";
import { BadImplementationException } from "@intuitionrobotics/ts-common/core/exceptions";

const resultsSorter = (items: FB_Type[], invert: boolean = true) => sortArray(items, (item: FB_Type) => item.numeric, invert);

export const scenarioCollectionDelete = __scenario("Delete");
scenarioCollectionDelete.add(testCollectionWithUnique.processClean("Insert and delete - one item", async (collection) => {
	await collection.insert(testInstance1);

	const items = await collection.getAll();
	assert("Expected only one item", items.length, 1);

	await collection.deleteAll();
	assert("Expected no items", (await collection.getAll()).length, 0);
}));


scenarioCollectionDelete.add(testCollectionWithUnique.processClean("Insert and delete - three item", async (collection) => {
	await collection.insertAll([testInstance1, testInstance1, testInstance1]);

	const items = await collection.getAll();
	assert("Expected three items", items.length, 3);

	await collection.deleteAll();
	assert("Expected no items", (await collection.getAll()).length, 0);
}));


scenarioCollectionDelete.add(testCollectionWithUnique.processClean("Insert 3 items and delete one", async (collection) => {
	await collection.insertAll([testInstance2, testInstance1, testInstance1]);

	const items = resultsSorter(await collection.getAll());
	assert("Expected three items", items, [testInstance1, testInstance1, testInstance2]);

	await collection.deleteItem(testInstance2);
	assert("Expected two same items", (await collection.getAll()), [testInstance1, testInstance1]);
}));


scenarioCollectionDelete.add(testCollectionWithUnique.processClean("Insert 3 items and delete two similar", async (collection) => {
	await collection.insertAll([testInstance2, testInstance1, testInstance1]);

	const items = resultsSorter(await collection.getAll());
	assert("Expected three items", items, [testInstance1, testInstance1, testInstance2]);

	await collection.delete({where: {numeric: testInstance1.numeric}});
	assert("Expected one item items", (await collection.getAll()), [testInstance2]);
}));


scenarioCollectionDelete.add(testCollectionWithUnique.processClean("Insert 3 items and delete unique two similar - (EXPECT TO FAIL)", async (collection) => {
	await collection.insertAll([testInstance2, testInstance1, testInstance1]);

	const items = resultsSorter(await collection.getAll());
	assert("Expected three items", items, [testInstance1, testInstance1, testInstance2]);

	await collection.delete({where: {numeric: testInstance1.numeric}});
	assert("Expected one item items", (await collection.getAll()), [testInstance2]);
}).expectToFail(BadImplementationException, e => e.message.startsWith("too many results")));


scenarioCollectionDelete.add(testCollectionWithUnique.processClean("Insert 3 different items and delete two different", async (collection) => {
	await collection.insertAll([testInstance1, testInstance2, testInstance3]);

	const items = resultsSorter(await collection.getAll());
	assert("Expected three items", items, [testInstance1, testInstance2, testInstance3]);

	await collection.delete({where: {numeric: {$gt: testInstance1.numeric}}});
	assert("Expected one item items", (await collection.getAll()), [testInstance1]);
}));

