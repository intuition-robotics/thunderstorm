
import {Exception} from "../core/exceptions";


type InferInput<Model> = Model extends TestModel<infer I, any> ? I : Model;
type InferResult<Model> = Model extends TestModel<any, infer R> ? R : void;

export type TestModel<Input, Result = void> = {
	expected?: Result;
	input: Input;
}

export type TestSuit<Model extends TestModel<Input, Result>, Input = InferInput<Model>, Result = InferResult<Model>> = {
	key: string;
	label: string;
	models: TestModel<Input, Result>[];
	processor: (model: Input) => Promise<Result>;
}

type TestSuitReport = {
	label: string;
	success: number;
	failed: Exception[];
};
const testResults: { [k: string]: TestSuitReport } = {};

export async function runTestSuits(testSuits: TestSuit<any, any, any>[]) {
	for (const testSuit of testSuits) {
		await runTestSuit(testSuit);
	}
}

export async function runTestSuit<Model extends TestModel<Input, Result>, Input = InferInput<Model>, Result = InferResult<Model>>(testSuit: TestSuit<Model, Input, Result>) {
	const report: TestSuitReport = {
		label: testSuit.label,
		success: 0,
		failed: []
	};

	testResults[testSuit.key] = report;
	console.log(` Running: ${testSuit.label}`);

	for (const model of testSuit.models) {
		const result = await testSuit.processor(model.input);
		if (model.expected === undefined || model.expected === result) {
			report.success++;
			continue;
		}

		report.failed.push(
			new Exception(`Error in test #${testSuit.models.indexOf(model)} input: ${JSON.stringify(
				model.input)}\n         -- Expected: ${model.expected}\n         --   Actual: ${result}`));
	}
}


export function assertNoTestErrors() {
	let totalErrors = 0;
	console.log();
	console.log("+-------------------------------+");
	console.log("|            RESULTS            |");
	console.log("+-------------------------------+");
	Object.keys(testResults).forEach((key, index) => {
		const result = testResults[key];
		console.log();
		console.log(` + ${result.label}`);
		console.log(`     Success: ${result.success}`);
		if (result.failed.length === 0)
			return;

		totalErrors += result.failed.length;
		console.log(`     Errors: ${result.failed.length}`);
		result.failed.forEach(error => console.log(`       ${error.message}`));
	});

	if (totalErrors > 0)
		process.exit(2);
}

