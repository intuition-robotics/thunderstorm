import {Module} from "@intuitionrobotics/ts-common/core/module";
import {User_Group} from "../../shared/assign-types";
import {PermissionsAssert} from "./permissions-assert";

export class PermissionsShare_Class
    extends Module {

    constructor() {
        super("PermissionsShare");
    }

    async verifyPermissionGrantingAllowed(granterUserId: string, shareGroup: User_Group) {
        await PermissionsAssert.assertUserSharingGroup(granterUserId, shareGroup);
    }

}

export const PermissionsShare = new PermissionsShare_Class();
