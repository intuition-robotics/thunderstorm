import {simpleTypeCollectionUpsert} from "../_core/consts";
import {SimpleType} from "../_core/types";
import {__scenario} from "@intuitionrobotics/testelot";
import { BadImplementationException } from "@intuitionrobotics/ts-common/core/exceptions";

export const scenarioUpsert = __scenario('Upsert');

scenarioUpsert.add(simpleTypeCollectionUpsert.processClean("Upsert", async (collection) => {
	const x: SimpleType = {
		label: 'a',
		deleteId: 'b'
	};
	await collection.upsert(x)

}));
scenarioUpsert.add(simpleTypeCollectionUpsert.processClean("Upsert undefined should fail", async (collection) => {
	const x: SimpleType = {
		label: 'a',
		deleteId: 'b',
		optional: undefined
	};
	await collection.upsert(x)

}).expectToFail(BadImplementationException, (e: Error) => e.message.toLowerCase().startsWith("no where properties are allowed to be null or undefined")));
