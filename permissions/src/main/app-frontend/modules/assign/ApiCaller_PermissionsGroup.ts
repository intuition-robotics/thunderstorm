import {ThunderDispatcher} from "@intuitionrobotics/thunderstorm/app-frontend/core/thunder-dispatcher";
import {BaseDB_ApiGeneratorCaller} from "@intuitionrobotics/db-api-generator/app-frontend/BaseDB_ApiGeneratorCaller";
import {DB_PermissionsGroup} from "../../../shared/assign-types";

export interface OnPermissionsGroupsLoaded {
    __onPermissionsGroupsLoaded: () => void;
}

const dispatch_onPermissionsGroupsLoaded = new ThunderDispatcher<OnPermissionsGroupsLoaded, "__onPermissionsGroupsLoaded">("__onPermissionsGroupsLoaded");

export class PermissionsGroupModule_Class
    extends BaseDB_ApiGeneratorCaller<DB_PermissionsGroup> {
    private groups: DB_PermissionsGroup[] = [];

    constructor() {
        super({key: "group", relativeUrl: "/v1/permissions/assign/group"}, "PermissionsGroupModule");
    }

    protected init(): void {
        super.init();
    }

    protected async onEntryCreated(response: DB_PermissionsGroup): Promise<void> {
        this.query();
    }

    protected async onEntryDeleted(response: DB_PermissionsGroup): Promise<void> {
        this.query();
    }

    protected async onEntryUpdated(response: DB_PermissionsGroup): Promise<void> {
        this.query();
    }

    protected async onGotUnique(response: DB_PermissionsGroup): Promise<void> {
    }

    protected async onQueryReturned(response: DB_PermissionsGroup[]): Promise<void> {
        this.groups = response;
        dispatch_onPermissionsGroupsLoaded.dispatchUI([]);
    }

    getGroups() {
        return this.groups;
    }

}

export const ApiCaller_PermissionsGroup = new PermissionsGroupModule_Class();
