
import {
	BeLogged,
	LogClient_MemBuffer,
	Logger,
	padNumber
} from "../_main";

BeLogged.addClient(new LogClient_MemBuffer("test mem buffer", 10, 1024).setRotationListener(() => {
	console.log(`Rotating buffer`);
}));

class TestLogger
	extends Logger {

	writeLogs() {
		for (let i = 0; i < 1000; i++) {
			this.logDebug(`This is a test line ${padNumber(i, 5)}`);
		}
	}
}


new TestLogger().writeLogs();
