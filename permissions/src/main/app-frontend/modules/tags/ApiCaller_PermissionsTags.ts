import {BaseDB_ApiGeneratorCaller} from "@intuitionrobotics/db-api-generator/app-frontend/BaseDB_ApiGeneratorCaller";
import {ThunderDispatcher} from "@intuitionrobotics/thunderstorm/app-frontend/core/thunder-dispatcher";
import {DB_GroupTags} from "../../../shared/assign-types";

export interface OnPermissionsTagsLoaded {
    __onPermissionsTagsLoaded: () => void
}

const dispatch_onPermissionsTagsLoaded = new ThunderDispatcher<OnPermissionsTagsLoaded, "__onPermissionsTagsLoaded">("__onPermissionsTagsLoaded");

export class PermissionsTagsModule_Class
    extends BaseDB_ApiGeneratorCaller<DB_GroupTags> {
    private tags: DB_GroupTags[] = [];

    constructor() {
        super({key: "tags", relativeUrl: "/v1/permissions/tags/permissionsTags"}, "PermissionsTagsModule");
    }

    protected init(): void {
    }

    protected async onEntryCreated(response: DB_GroupTags): Promise<void> {
        this.query();
    }

    //delete all tags in groups too
    protected async onEntryDeleted(response: DB_GroupTags): Promise<void> {
        this.query();
    }

    protected async onEntryUpdated(response: DB_GroupTags): Promise<void> {
        this.query();
    }

    protected async onGotUnique(response: DB_GroupTags): Promise<void> {
    }

    protected async onQueryReturned(response: DB_GroupTags[]): Promise<void> {
        this.tags = response;
        dispatch_onPermissionsTagsLoaded.dispatchUI([]);
    }


    getTags() {
        return this.tags;
    }
}

export const ApiCaller_PermissionsTags = new PermissionsTagsModule_Class();
