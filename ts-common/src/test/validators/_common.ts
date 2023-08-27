
import {validate} from "../_main";
import {ValidatorTestInput} from "./test";

export const validatorProcessor = async <T extends object>(model: ValidatorTestInput<T>) => {
	try {
		await validate(model.instance, model.validator);
		return "pass";
	} catch (e) {
		return "fail";
	}
};
