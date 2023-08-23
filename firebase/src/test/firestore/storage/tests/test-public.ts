import {
	__custom,
	__scenario
} from "@intuitionrobotics/testelot";
import { generateHex } from "@intuitionrobotics/ts-common/utils/random-tools";
import { FirebaseModule } from "../../../../main/app-backend/FirebaseModule";
import { BucketWrapper } from "../../../../main/app-backend/storage/StorageWrapper";

export function makeFilesPublicTest() {
	const scenario = __scenario("Save files and delete them");
	const testFolder = "test-folder";
	const testFilePrefix = "test-file";
	const pathToTestFile = `${testFolder}/${testFilePrefix}`;
	let bucket: BucketWrapper;
	const pathToRemoteFile = `${pathToTestFile}-string--${generateHex(4)}.txt`;


	scenario.add(__custom(async () => {
		bucket = await FirebaseModule.createAdminSession().getStorage().getOrCreateBucket();
	}).setLabel("Create Storage"),);

	scenario.add(__custom(async () => {
		return (await bucket.getFile(pathToRemoteFile)).write("This is a test string");
	}).setLabel("Save string to file"));

	scenario.add(__custom(async () => {
		const bucketPath = await bucket.getFile(pathToRemoteFile)
		console.log(`https://storage.googleapis.com/${bucketPath.bucket.bucketName}/${testFolder}/${pathToRemoteFile}`)
		// console.log(await bucket.getFile(`${pathToTestFile}-string.txt`))
		return (await bucket.getFile(pathToRemoteFile)).makePublic();
	}).setLabel("Making path public"));

	return scenario;
}


