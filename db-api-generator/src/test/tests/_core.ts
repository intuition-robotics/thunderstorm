
import {__custom} from "@intuitionrobotics/testelot";
import {ExampleModule} from "./db-api-generator";

export function cleanup() {
	return __custom(async () => {
		await ExampleModule.delete({where: {}})
	}).setLabel("Cleaning up examples collection.");
}
