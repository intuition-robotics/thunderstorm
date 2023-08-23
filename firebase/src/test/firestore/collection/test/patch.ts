import {__scenario} from "@intuitionrobotics/testelot";
import {Patch_TestCase,} from "../_core/types";
import {FirestoreCollection_Tester} from "../_core/collection-wrapper";
import { generateHex } from "@intuitionrobotics/ts-common/utils/random-tools";
import { assert } from "@intuitionrobotics/ts-common/utils/object-tools";
import { merge } from "@intuitionrobotics/ts-common/utils/merge-tools";
import { BadImplementationException } from "@intuitionrobotics/ts-common/core/exceptions";

type DBType = {
	id: string,
	a?: string,
	b?: string,
	c?: string
};

export type Patch_Model = Patch_TestCase<any>
const obj = {pah: "zevel", pahey: "ashpa"};

export const testPatchCollection = new FirestoreCollection_Tester<DBType>("test-patch-collection", ["id"]);

function patchTestCase(model: Patch_Model) {
	return testPatchCollection.processClean(model.label, async (collection) => {
		const id = generateHex(16);
		await collection.insert(obj as any);
		await collection.insert({id, ...model.insert});
		await collection.patch({id, ...model.override});
		const patched = await collection.queryUnique({where: {id}});
		assert("Objects do not match", merge({id}, merge(model.insert, model.override)), patched);
	});
}

// Expect Fail
function patchNonExistingDoc() {
	return testPatchCollection.processClean('Patching non existent doc', async (collection) => {
		await collection.patch({id: generateHex(8)});
	}).expectToFail(BadImplementationException, e => e.message.startsWith("Patching a non existent doc"))
}

function patchDoubleDoc() {
	return testPatchCollection.processClean('Patching a doc when there are already two with the same uniqueness', async (collection) => {
		const key = generateHex(8);
		await collection.insertAll(Array(2).fill(0).map(i => ({id: key})))
		await collection.patch({id: key});
	}).expectToFail(BadImplementationException, e => e.message.startsWith("too many results for query"))
}
// End Expect Fail

const obj_simpleA1 = {a: "label a1"};
const obj_simpleB1 = {b: "label b1"};
const obj_simpleB2 = {b: "label b2"};
const obj_simpleB1C1 = {b: "label b2", c: "label c1"};

const patchTests: Patch_Model[] = [
	{
		insert: {obj_simpleA1},
		override: obj_simpleB1,
		query: {where: obj_simpleB1},
		label: "patch two simple objects, one prop merge"
	},
	{
		insert: obj_simpleB1C1,
		override: obj_simpleB2,
		query: {where: obj_simpleB2},
		label: "patch two simple objects, two props"
	}
];


export const scenarioCollectionPatch = __scenario("Patch");
for (const patchTest of patchTests) {
	scenarioCollectionPatch.add(patchTestCase(patchTest));
}
scenarioCollectionPatch.add(patchNonExistingDoc());
scenarioCollectionPatch.add(patchDoubleDoc());
