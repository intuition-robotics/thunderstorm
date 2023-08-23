import {
	AccessLevelPermissionsDB,
	ApiPermissionsDB,
	DomainPermissionsDB,
	ProjectPermissionsDB
} from "../modules/db-types/managment";
import {GroupPermissionsDB, UserPermissionsDB} from "../modules/db-types/assign";
import {PermissionsAssert} from "../modules/permissions-assert";
import {PermissionsModule} from "../modules/PermissionsModule";
import {TagsDB} from "../modules/TagsModule";

export const Backend_ModulePack_Permissions = [
    ProjectPermissionsDB,
    DomainPermissionsDB,
    AccessLevelPermissionsDB,
    ApiPermissionsDB,
    GroupPermissionsDB,
    UserPermissionsDB,
    PermissionsAssert,
    PermissionsModule,
    TagsDB
];
