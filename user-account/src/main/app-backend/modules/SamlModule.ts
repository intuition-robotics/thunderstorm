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

import {ImplementationMissingException} from "@intuitionrobotics/ts-common/core/exceptions";
import {Module} from "@intuitionrobotics/ts-common/core/module";
import {__stringify} from "@intuitionrobotics/ts-common/utils/tools";
import {
    IdentityProvider,
    IdentityProviderOptions,
    SAMLAssertResponse,
    ServiceProvider,
    ServiceProviderOptions
} from "saml2-js";
import {RequestParams_LoginSAML} from "../../shared/api";

import {RequestBody_SamlAssertOptions} from "./types";

type SamlConfig = {
    idConfig: IdentityProviderOptions,
    spConfig: ServiceProviderOptions
};

// type _SamlAssertResponse = {
// 	"response_header": {
// 		"version": "2.0",
// 		"destination": string,
// 		"in_response_to": string,
// 		"id": string
// 	},
// 	"type": "authn_response",
// 	"user": {
// 		"name_id": string,
// 		"session_index": string,
// 		"attributes": {}
// 	}
// }

type SamlAssertResponse = {
    fullResponse: SAMLAssertResponse
    userId: string
    loginContext: RequestParams_LoginSAML
}

export class SamlModule_Class
    extends Module<SamlConfig> {

    public identityProvider!: IdentityProvider;

    constructor() {
        super("SamlModule");
    }

    protected init(): void {
        if (!this.config.idConfig)
            throw new ImplementationMissingException("Config must contain idConfig");

        if (!this.config.spConfig)
            throw new ImplementationMissingException("Config must contain spConfig");

        this.identityProvider = new IdentityProvider(this.config.idConfig);
    }

    loginRequest = async (loginContext: RequestParams_LoginSAML) => {
        return new Promise<string>((resolve, rejected) => {
            const sp = new ServiceProvider(this.config.spConfig);
            const options = {
                relay_state: __stringify(loginContext)
            };
            sp.create_login_request_url(this.identityProvider, options, (error, loginUrl, requestId) => {
                if (error)
                    return rejected(error);

                resolve(loginUrl);
            });
        });

    };

    assert = async (options: RequestBody_SamlAssertOptions): Promise<SamlAssertResponse> => new Promise<SamlAssertResponse>((resolve, rejected) => {
        const sp = new ServiceProvider(this.config.spConfig);
        sp.post_assert(this.identityProvider, options, async (error, response: SAMLAssertResponse) => {
            if (error)
                return rejected(error);

            const userId = response.user.name_id;
            const relay_state = options.request_body.RelayState;
            if (!relay_state)
                return rejected(`LoginContext lost along the way for userId '${userId}'`);

            resolve({
                userId: userId,
                loginContext: JSON.parse(relay_state),
                fullResponse: response
            });
        });
    });
}

export const SamlModule = new SamlModule_Class();
