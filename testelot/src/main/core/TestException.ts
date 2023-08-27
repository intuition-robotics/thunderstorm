import {CustomException} from "@intuitionrobotics/ts-common/core/exceptions";


export class TestException
	extends CustomException {

	constructor(message: string) {
		super(TestException, message)
	}
}
