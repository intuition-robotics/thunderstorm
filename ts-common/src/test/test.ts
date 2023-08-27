
import {
	assertNoTestErrors,
	runTestSuits,
	TestSuit
} from "../main/testing/test-model";
import {testSuit_versionComparison} from "./version-tools/versions";
import {testSuits_validator} from "./validators/test";
import {testSuit_compare} from "./compare/compare";
import {testSuit_newSecret} from "./newSecret/newSecret";
import {testSuit_filter} from "./object/recursive-find-all-true";
import {testSuit_batchAction} from "./batchAction/batchAction";

// require("./logger/test-logger");
// require("./merge/test-merge");
// require("./compare/compare");
// require("./clone/test-clone");

const testSuits: TestSuit<any, any, any>[] = [
	testSuit_versionComparison,
	testSuit_compare,
	testSuit_batchAction,
	testSuit_newSecret,
	testSuit_filter,
	...testSuits_validator,
];


runTestSuits(testSuits)
	.then(() => assertNoTestErrors())
	.catch((err) => {
		console.log("Error running tests", err);
		process.exit(2);
	});
