/*
 * ts-common is the basic building blocks of our typescript projects
 *
 * Copyright (C) 2020 Intuition Robotics
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
