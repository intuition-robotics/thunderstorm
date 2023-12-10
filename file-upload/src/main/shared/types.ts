import {ApiWithBody} from "@intuitionrobotics/thunderstorm";
import {DB_Object} from "@intuitionrobotics/firebase";
import {
	AuditBy,
	ObjectTS
} from "@intuitionrobotics/ts-common";
import {MessageType} from "@intuitionrobotics/push-pub-sub";

export const fileUploadedKey = "file-uploaded";
export type Push_FileUploaded = MessageType<"file-uploaded", { feId: string }, { message: string, result: string, cause?: any }>;

export enum UploadResult {
	Success = "Success",
	Failure = "Failure"
}

export type Request_Uploader = {
	name: string
	mimeType: string
	key?: string
	public?: boolean
	metadata?: ObjectTS
}

export type BaseUploaderFile = Request_Uploader & {
	feId: string
};

export type DB_Temp_File = DB_Object & BaseUploaderFile & Required<Pick<BaseUploaderFile, "key">> & {
	path: string
	_audit: AuditBy
	bucketName: string
}
export type Request_GetUploadUrl = BaseUploaderFile[]

export type TempSecureUrl = {
	secureUrl: string
	tempDoc: DB_Temp_File
}

export type Api_GetUploadUrl = ApiWithBody<"/v1/upload/get-url", BaseUploaderFile[], TempSecureUrl[]>
