import {
	auditValidator,
	TypeValidator,
	validateExists,
	validateRegexp
} from "@intuitionrobotics/ts-common";
import {ServerApi} from "@intuitionrobotics/thunderstorm/backend";
import {
	BaseDB_ApiGenerator,
	validateUniqueId
} from "@intuitionrobotics/db-api-generator/backend";
import {DB_Temp_File} from "../../shared/types";

export const TEMP_COLLECTION = "temp-files-upload";

export const validateName = validateRegexp(/^.{3,}$/);

export class UploaderTempFileModule_Class
	extends BaseDB_ApiGenerator<DB_Temp_File> {
	static _validator: TypeValidator<DB_Temp_File> = {
		_id: validateUniqueId,
		name: validateName,
		feId: validateExists(true),
		mimeType: validateExists(true),
		key: validateExists(true),
		path: validateExists(true),
		_audit: auditValidator(),
		bucketName: validateExists(true),
		public: undefined,
		metadata: undefined
	};

	constructor() {
		super(TEMP_COLLECTION, UploaderTempFileModule_Class._validator, "temp-files", "UploaderTempFileModule");
	}

	apis(pathPart?: string): ServerApi<any>[] {
		return [];
	}
}

export const UploaderTempFileModule = new UploaderTempFileModule_Class();




