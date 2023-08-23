import {MessageType} from "@intuitionrobotics/push-pub-sub/shared/types";
import {ApiWithBody} from "@intuitionrobotics/thunderstorm/shared/types";
import {AuditBy, DB_Object, ObjectTS} from "@intuitionrobotics/ts-common/utils/types";

export const fileUploadedKey = "file-uploaded";
export type Push_FileUploaded = MessageType<"file-uploaded", { feId: string }, {
    message: string,
    result: string,
    cause?: Error
}>;

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
