import {BaseDB_ApiGeneratorCaller} from "@intuitionrobotics/db-api-generator/app-frontend/BaseDB_ApiGeneratorCaller";
import {ThunderDispatcher} from "@intuitionrobotics/thunderstorm/app-frontend/core/thunder-dispatcher";
import {TypedMap} from "@intuitionrobotics/ts-common/utils/types";
import {DB_PermissionApi} from "../../../shared/manager-types";

export interface OnPermissionsApisLoaded {
    __onPermissionsApisLoaded: () => void;
}

const dispatch_onPermissionsApisLoaded = new ThunderDispatcher<OnPermissionsApisLoaded, "__onPermissionsApisLoaded">("__onPermissionsApisLoaded");

export class PermissionsApiModule_Class
    extends BaseDB_ApiGeneratorCaller<DB_PermissionApi> {
    private apis: TypedMap<DB_PermissionApi[]> = {};

    constructor() {
        super({key: "level", relativeUrl: "/v1/permissions/manage/api"}, "PermissionsApiModule");
    }

    protected init(): void {
    }

    protected async onEntryCreated(response: DB_PermissionApi): Promise<void> {
        this.query();
    }

    protected async onEntryDeleted(response: DB_PermissionApi): Promise<void> {
        this.query();
    }

    protected async onEntryUpdated(response: DB_PermissionApi): Promise<void> {
        this.query();
    }

    protected async onGotUnique(response: DB_PermissionApi): Promise<void> {
    }

    protected async onQueryReturned(response: DB_PermissionApi[]): Promise<void> {
        const newApis: TypedMap<DB_PermissionApi[]> = {};
        response.forEach(api => {
            const apiArray = newApis[api.projectId] || (newApis[api.projectId] = []);
            apiArray.push(api);
        });
        this.apis = newApis;
        dispatch_onPermissionsApisLoaded.dispatchUI([]);
    }

    getApis(projectId: string): DB_PermissionApi[] {
        return this.apis[projectId] || [];
    }


}

export const ApiCaller_PermissionsApi = new PermissionsApiModule_Class();
