
type FunctionKeys<T> = { [K in keyof T]: T[K] extends Function ? K : never }[keyof T];

class Dispatcher<T extends object, K extends FunctionKeys<T>, P = Parameters<T[K]>> {

	protected readonly method: K;

	constructor(method: K) {
		this.method = method;
	}

	public call1(obj: T, ...p: [P]) {
		// here it passes the first argument as an array with disregard to the types
		(obj[this.method])(p);
	}

	public call2(obj: T, p: P) {
		// here compilation error:  type 'P' is not an array
		// but if I ts ignore, it passes as expected
		(obj[this.method])(...[p]);
	}
}


interface TestInterface {
	methodToCall: (str: string, num: number) => void;
}

class TestClass
	implements TestInterface {

	methodToCall(str: string, num: number) {
		console.log({str, num});
	};
}


const instance = new TestClass();

const dispatcher = new Dispatcher<TestInterface, "methodToCall">("methodToCall");

dispatcher.call1(instance, ["string", 42]);
// dispatcher.call1(instance, "string", 42);
// dispatcher.call2(instance, "string", 42);
