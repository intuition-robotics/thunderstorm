/*
 * A typescript & react boilerplate with api call example
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
import {TS_ServiceWorker} from '@intuitionrobotics/thunderstorm/index-sw';
import {FirebaseModule} from "@intuitionrobotics/firebase/frontend";
import {PushPubSubModule} from "@intuitionrobotics/push-pub-sub/index-sw";

new TS_ServiceWorker()
	.setConfig(require('../main/config').config)
	.addModules(FirebaseModule, PushPubSubModule)
	.build();


// export default null;
