
import {
	Queue,
	timeout
} from "../_main";

const queue = new Queue("test");

function addItem(key: string, sleepMs: number) {
	queue.addItem(async () => {
		console.log(`Start ${key}`);
		await timeout(sleepMs);
		console.log(`End ${key}`);
	});
}

for (let i = 0; i < 20; i += 3) {
	addItem(`${i}`, 2000);
	addItem(`${i + 1}`, 3000);
	addItem(`${i + 2}`, 4000);
}

queue.setParallelCount(3);
queue.setOnQueueEmpty(() => console.log("EMPTY EVENT"));
// @ts-ignore
queue.execute();
