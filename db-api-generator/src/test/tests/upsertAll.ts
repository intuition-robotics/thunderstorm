
import {
	__custom,
	__scenario
} from "@intuitionrobotics/testelot";
import {cleanup} from "./_core";
import {ExampleModule} from "./db-api-generator";
import { generateHex } from "@intuitionrobotics/ts-common/utils/random-tools";
import { assert } from "@intuitionrobotics/ts-common/utils/object-tools";

const exampleDocument1 = {
	first: "first",
	second: "second",
	third: "third"
};
const exampleDocument2 = {
	_id: generateHex(32),
	first: "first2",
	second: "second2",
	third: "third2"
};
const exampleDocument3 = {
	first: "first3",
	second: "second3",
	third: "third3"
};

export function upsertAllTest() {
	const scenario = __scenario("UpsertAll");
	scenario.add(cleanup());
	scenario.add(__custom(async () => {
		const docs = new Array(10).fill(0).map(() => exampleDocument1);
		await ExampleModule.upsertAll(docs);

		assert("Expecting 10 docs in the db", (await ExampleModule.query({where: {}})).length, 10);
	}).setLabel("Upserting 10 docs"));

	scenario.add(cleanup());

	scenario.add(__custom(async () => {
		const docs = [exampleDocument1, exampleDocument2,exampleDocument3];
		const ret = await ExampleModule.upsertAll(docs);

		assert("Expecting the order of the passed elements to be maintained", ret[1], exampleDocument2);
	}).setLabel("Upserting ordered"));

	// scenario.add(cleanup());
	//
	// scenario.add(__custom(async () => {
	// 	const docs = new Array(10).fill(0).map(() => exampleDocument1);
	// 	await ExampleModule.upsertAll(docs);
	//
	// 	assert("Expecting 10 docs in the db", (await ExampleModule.query({where: {}})).length, 10);
	// }).setLabel("Upserting 10 docs"));

	return scenario;
}
