import {
	BaseUploaderFile,
	DB_Temp_File,
	fileUploadedKey,
	Push_FileUploaded,
	TempSecureUrl,
	UploadResult
} from "../../shared/types";
import {UploaderTempFileModule} from "./UploaderTempFileModule";
import {OnFileUploaded} from "./BucketListener";
import {FileWrapper, StorageWrapper} from "@intuitionrobotics/firebase/app-backend/storage/StorageWrapper";
import {Module} from "@intuitionrobotics/ts-common/core/module";
import {
	ImplementationMissingException,
	ThisShouldNotHappenException
} from "@intuitionrobotics/ts-common/core/exceptions";
import {FirebaseModule} from "@intuitionrobotics/firebase/app-backend/FirebaseModule";
import {generateHex} from "@intuitionrobotics/ts-common/utils/random-tools";
import {auditBy, Hour} from "@intuitionrobotics/ts-common/utils/date-time-tools";
import {PushPubSubModule} from "@intuitionrobotics/push-pub-sub/app-backend/modules/PushPubSubModule";

export const Temp_Path = "files-temp";

type Config = {
    bucketName?: string
    uploaderProjectId?: string
}

export type PostProcessor = (file: FileWrapper, doc: DB_Temp_File) => Promise<void>;

export class UploaderModule_Class
    extends Module<Config>
    implements OnFileUploaded {

    constructor() {
        super("UploaderModule");
    }

    private storage!: StorageWrapper;

    private postProcessor!: { [k: string]: PostProcessor };

    async __onFileUploaded(filePath?: string) {
        await this.fileUploaded(filePath);
    }

    setPostProcessor = (validator: { [k: string]: PostProcessor }) => {
        this.postProcessor = validator;
    };

    public getProcessor = (k: string) => {
        const postProcessorElement = this.postProcessor[k];
        if (!postProcessorElement)
            throw new ImplementationMissingException(`Missing validator for type ${k}`);

        return postProcessorElement;
    };

    init() {
        if (!this.postProcessor)
            throw new ImplementationMissingException("You must set a postProcessor for the UploaderModule");

        this.storage = FirebaseModule.createAdminSession(this.config.uploaderProjectId).getStorage();
    }

    async getUrl(body: BaseUploaderFile[], pathPrefix: string = Temp_Path): Promise<TempSecureUrl[]> {
        const bucketName = this.config?.bucketName;
        const bucket = await this.storage.getOrCreateBucket(bucketName);
        return Promise.all(body.map(async _file => {
            const key = _file.key || _file.mimeType;
            this.getProcessor(key);

            const _id = generateHex(32);
            const path = `${pathPrefix}/${_id}`;
            const instance: DB_Temp_File = {
                _id,
                feId: _file.feId,
                name: _file.name,
                mimeType: _file.mimeType,
                key,
                path,
                _audit: auditBy("be-stub"),
                bucketName: bucket.bucketName
            };

            if (_file.public)
                instance.public = _file.public;

            if (_file.metadata)
                instance.metadata = _file.metadata;

            const temp = await UploaderTempFileModule.upsert(instance);
            const file = await bucket.getFile(temp.path);
            const url = await file.getWriteSecuredUrl(_file.mimeType, Hour);
            return {
                secureUrl: url.securedUrl,
                tempDoc: temp
            };
        }));
    }

    fileUploaded = async (filePath?: string) => {
        if (!filePath)
            throw new ThisShouldNotHappenException("Missing file path");

        this.logInfo(`Looking for file with path ${filePath}`);

        // I use collection and not the module directly since I want to handle failure my way
        const tempMeta = await UploaderTempFileModule.collection.queryUnique({where: {path: filePath}});
        if (!tempMeta)
            return this.logInfo(`File with path: ${filePath}, not found in temp collection db`);

        this.logInfo(`Found temp meta with _id: ${tempMeta._id}`, tempMeta);
        const val = this.postProcessor[tempMeta.key];
        this.logInfo(`Found a validator ${!!val}`);
        if (!val)
            return this.notifyFrontend(tempMeta.feId, UploadResult.Failure, `Missing a validator for ${tempMeta.key} for file: ${tempMeta.name}`);

        const bucket = await this.storage.getOrCreateBucket(tempMeta.bucketName);
        const file = await bucket.getFile(tempMeta.path);
        if (tempMeta.public) {
            try {
                await file.makePublic();
            } catch (e) {
                await this.notifyFrontend(tempMeta.feId, UploadResult.Failure, `Failed to make the file public: ${tempMeta.name}`, e);
            }
        }

        try {
            await val(file, tempMeta);
        } catch (e) {
            //TODO delete the file and the temp doc
            return await this.notifyFrontend(tempMeta.feId, UploadResult.Failure, `Post-processing failed for file: ${tempMeta.name}`, e);
        }
        return this.notifyFrontend(tempMeta.feId, UploadResult.Success, `Successfully parsed and processed file ${tempMeta.name}`);
    };

    private notifyFrontend = async (feId: string, result: UploadResult, message: string, cause?: Error) => {
        cause && this.logWarning(cause);
        const data = {message, result, cause};
        await PushPubSubModule.pushToKey<Push_FileUploaded>(fileUploadedKey, {feId}, data);
    };

}

export const UploaderModule = new UploaderModule_Class();




