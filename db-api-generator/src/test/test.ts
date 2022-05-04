/*
 * Permissions management system, define access level for each of
 * your server apis, and restrict users by giving them access levels
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

import {StormTester} from "@intuitionrobotics/thunderstorm/backend-test";
import {__scenario} from "@intuitionrobotics/testelot";
import { FirebaseModule } from "@intuitionrobotics/firebase/backend";
import {
	deleteTest,
	ExampleModule,
	patchTest
} from "./tests/db-api-generator";
import {upsertAllTest} from "./tests/upsertAll";

export const mainScenario = __scenario("Tests for base-db-api-generator.");

mainScenario.add(upsertAllTest());
mainScenario.add(patchTest());
mainScenario.add(deleteTest());

module.exports = new StormTester()
	.addModules(FirebaseModule)
	.addModules(ExampleModule)
	.setScenario(mainScenario)
	.build();
