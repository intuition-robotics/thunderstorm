/*
 * Firebase is a simpler Typescript wrapper to all of firebase services.
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

import {__scenario} from "@intuitionrobotics/testelot";
import {scenarioInsert, scenarioInsertAll} from "./test/insert-and-query";
import {scenarioQueryUnique} from "./test/query-unique";
import {scenarioQuery} from "./test/query";
import {scenarioCollectionPatch} from "./test/patch";
import {scenarioCollectionDelete} from "./test/delete";
import {scenarioCollectionDeleteInTransaction} from "./test/delete-in-transaction";

export const testCollections = __scenario("test-collections");
testCollections.add(scenarioCollectionPatch);
testCollections.add(scenarioCollectionDelete);
testCollections.add(scenarioCollectionDeleteInTransaction);
testCollections.add(scenarioInsert);
testCollections.add(scenarioInsertAll);
testCollections.add(scenarioQueryUnique);
testCollections.add(scenarioQuery);
