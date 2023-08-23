import {BaseDB_ApiGeneratorCaller} from "@intuitionrobotics/db-api-generator/app-frontend/BaseDB_ApiGeneratorCaller";
import {ThunderDispatcher} from "@intuitionrobotics/thunderstorm/app-frontend/core/thunder-dispatcher";
import {DB_PermissionsUser} from "../../../shared/assign-types";

export interface OnPermissionsUsersLoaded {
    __onPermissionsUsersLoaded: () => void;
}

const dispatch_onPermissionsUsersLoaded = new ThunderDispatcher<OnPermissionsUsersLoaded, "__onPermissionsUsersLoaded">("__onPermissionsUsersLoaded");

export class PermissionsUserModule_Class
    extends BaseDB_ApiGeneratorCaller<DB_PermissionsUser> {
    private users: DB_PermissionsUser[] = [];

    constructor() {
        super({key: "user", relativeUrl: "/v1/permissions/assign/user"}, "PermissionsUserModule");
    }

    protected init(): void {
    }

    protected async onEntryCreated(response: DB_PermissionsUser): Promise<void> {
    }

    protected async onEntryDeleted(response: DB_PermissionsUser): Promise<void> {
    }

    protected async onEntryUpdated(response: DB_PermissionsUser): Promise<void> {
        this.query();
    }

    protected async onGotUnique(response: DB_PermissionsUser): Promise<void> {
    }

    protected async onQueryReturned(response: DB_PermissionsUser[]): Promise<void> {
        this.users = response;
        dispatch_onPermissionsUsersLoaded.dispatchUI([]);
    }

    getUserByAccountId(accountId: string) {
        return this.users.filter(user => user.accountId).find(user => user.accountId === accountId);
    }

    getUsers() {
        return this.users;
    }
}

export const ApiCaller_PermissionsUser = new PermissionsUserModule_Class();
