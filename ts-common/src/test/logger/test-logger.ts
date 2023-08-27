
import {
	LogClient_Terminal,
	MUSTNeverHappenException,
	ThisShouldNotHappenException,
	Logger,
	BeLogged
} from "../_main";


class TestLogger
	extends Logger {

	printOneLine() {
		this.logInfo("this is one line");
	}

	printTwoLines() {
		this.logInfo("this is line 1/2\nthis is line 2/2");
	}

	printOnlyError() {
		this.logInfo(new Error("this is a lonely error"));
	}

	printMyLonelyException() {
		this.logInfo(new ThisShouldNotHappenException("this is a my lonely Exception"));
	}

	printTextWithError() {
		this.logInfo("One line text.. with error", new Error("this is the error"));
	}

	printTextWithMyExceptionNoCause() {
		this.logInfo("One line text.. with my exception without a cause", new ThisShouldNotHappenException("this is the error without a cause"));
	}


	callOne() {
		this.callTwo();
	}

	callTwo() {
		this.throwError();
	}

	throwError() {
		throw new MUSTNeverHappenException("throwing an intentional error");
	}

	printTextWithMyExceptionWithCause() {
		try {
			this.callOne()
		} catch (e) {
			this.logInfo("One line text.. with my exception with a cause",
			             new ThisShouldNotHappenException("this is the error with a cause", e));
		}
	}
}


BeLogged.addClient(LogClient_Terminal);

const testLogger = new TestLogger();
console.log("--");
testLogger.printOneLine();
console.log("--");
testLogger.printTwoLines();
console.log("--");
testLogger.printOnlyError();
console.log("--");
testLogger.printMyLonelyException();
console.log("--");
testLogger.printTextWithError();
console.log("--");
testLogger.printTextWithMyExceptionNoCause();
console.log("--");
testLogger.printTextWithMyExceptionWithCause();
console.log("--");
