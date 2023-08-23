import {simpleTypeCollection} from "../_core/consts";
import {__scenario} from "@intuitionrobotics/testelot";
import { generateHex } from "@intuitionrobotics/ts-common/utils/random-tools";
import { BadImplementationException } from "@intuitionrobotics/ts-common/core/exceptions";

export const scenarioCollectionDeleteInTransaction = __scenario("Delete In Transaction");
const deleteId = generateHex(8);
const n = 600;

scenarioCollectionDeleteInTransaction.add(simpleTypeCollection.processClean(`Addding ${n} Elements`, async (collection) => {

	// console.log(`Inserting ${n} elements....`);
	const instances = new Array(n).fill(0).map(e => ({
		label: generateHex(16),
		deleteId
	}));
	await collection.insertAll(instances);
	// console.log('inserted normally');
	// await collection.runInTransaction(transaction => {
	// 	return transaction.insertAll(collection,instances)
	// })
	// console.log(`Inserted ${n} elements....`);
}));

scenarioCollectionDeleteInTransaction.add(simpleTypeCollection.processDirty("Trying to Delete Elements", async (collection) => {
	// console.log('Deleting a ton of documents');
	await collection.runInTransaction(transaction => {
		return transaction.delete(collection, {where: {deleteId: deleteId}});
	});
	// console.log('Deleted a ton of documents');

	// assert("Expected db to be empty", (await collection.getAll()).length, 0);
}).expectToFail(BadImplementationException,(e: Error) => e.message.toLowerCase().startsWith("trying to delete")));
