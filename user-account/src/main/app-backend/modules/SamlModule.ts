
import {
	IdentityProvider,
	IdentityProviderOptions,
	SAMLAssertResponse,
	ServiceProvider,
	ServiceProviderOptions
} from "saml2-js";
import {
	__stringify,
	ImplementationMissingException,
	Module
} from "@intuitionrobotics/ts-common";
import {
	RequestBody_SamlAssertOptions,
	RequestParams_LoginSAML
} from "./_imports";

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
