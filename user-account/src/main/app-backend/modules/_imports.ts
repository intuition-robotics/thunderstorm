
import {AuditBy, DB_Object} from "@intuitionrobotics/ts-common";

export * from "../../index";

export type RequestBody_SamlAssertOptions = {
	request_body: {
		SAMLResponse: string
		RelayState: string
	},
	allow_unencrypted_assertion?: boolean;
}

export type DB_Account = DB_Object & {
	email: string
	_audit: AuditBy

	salt?: string
	saltedPassword?: string
}

