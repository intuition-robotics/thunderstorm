/*
 * Permissions management system, define access level for each of
 * your server apis, and restrict users by giving them access levels
 *
 * Copyright (C) 2020 Adam van der Kruk aka TacB0sS
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
	BaseUploaderFile,
	TempSecureUrl
} from "../../shared/types";
import {BaseUploaderModule_Class} from "../../shared/modules/BaseUploaderModule";
import {
	ApiTypeBinder,
	DeriveBodyType,
	DeriveQueryType,
	DeriveResponseType,
	DeriveUrlType,
	HttpMethod,
	QueryParams
} from "@nu-art/thunderstorm";
import {
	BeHttpModule,
	BeHttpRequest
} from "@nu-art/thunderstorm/app-backend/modules/http/BeHttpModule";
import {DeriveRealBinder} from "@nu-art/thunderstorm/frontend";


export class ServerUploaderModule_Class
	extends BaseUploaderModule_Class
	// implements OnPushMessageReceived<Push_FileUploaded>
{

	protected createRequest<Binder extends ApiTypeBinder<U, R, B, P>,
		U extends string = DeriveUrlType<Binder>,
		R = DeriveResponseType<Binder>,
		B = DeriveBodyType<Binder>,
		P extends QueryParams = DeriveQueryType<Binder>>(method: HttpMethod, key: string, data?: string): BeHttpRequest<DeriveRealBinder<Binder>> {
		return BeHttpModule.createRequest<Binder>(method, key, data);
	}

	upload(file: Buffer, name: string, mimeType: string, key?: string): BaseUploaderFile[] | undefined {
		return this.uploadImpl([{name, mimeType, key, file}]);
	}

	protected async subscribeToPush(toSubscribe: TempSecureUrl[]): Promise<void> {
		// Not sure now
		// We said timeout
	}

	// Get notification it uploaded somehow or ping server
	// __onMessageReceived(pushKey: string, props: { feId: string }, data: { message: string, result: string }): void {
	// 	this.logInfo('Message received from service worker', pushKey, props, data);
	// 	if (pushKey !== fileUploadedKey)
	// 		return;
	//
	// 	switch (data.result) {
	// 		case UploadResult.Success:
	// 			this.setFileInfo(props.feId, "status", FileStatus.Completed);
	// 			break;
	// 		case UploadResult.Failure:
	// 			this.setFileInfo(props.feId, "status", FileStatus.Error);
	// 			break;
	// 	}
	//
	// 	PushPubSubModule.unsubscribe({pushKey: fileUploadedKey, props}).catch();
	// }
}

export const ServerUploaderModule = new ServerUploaderModule_Class();




