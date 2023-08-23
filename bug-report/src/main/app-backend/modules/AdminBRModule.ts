import {Module} from "@intuitionrobotics/ts-common/core/module";
import {DB_BugReport, Paths} from "../../shared/api";
import {FirebaseModule} from "@intuitionrobotics/firebase/app-backend/FirebaseModule";
import {FirestoreCollection} from "@intuitionrobotics/firebase/app-backend/firestore/FirestoreCollection";
import {StorageWrapper} from "@intuitionrobotics/firebase/app-backend/storage/StorageWrapper";


type Config = {
    projectId: string
    bucket?: string,
}

export class AdminBRModule_Class
    extends Module<Config> {

    constructor() {
        super("AdminBRModule");
    }

    private bugReport!: FirestoreCollection<DB_BugReport>;
    private storage!: StorageWrapper;

    protected init(): void {
        const sessAdmin = FirebaseModule.createAdminSession();
        const firestore = sessAdmin.getFirestore();
        this.bugReport = firestore.getCollection<DB_BugReport>('bug-report', ['_id']);
        this.storage = sessAdmin.getStorage();
    }

    getFilesFirebase = async () => this.bugReport.getAll();

    downloadFiles = async (path: Paths) => {
        const bucket = await this.storage.getOrCreateBucket(this.config?.bucket);
        const file = await bucket.getFile(path.path);
        return file.getReadSecuredUrl(600000);
    }
}

export const AdminBRModule = new AdminBRModule_Class();
