import {ApiCaller_PermissionsUser} from "../modules/assign/ApiCaller_PermissionsUser";
import {ApiCaller_PermissionsGroup} from "../modules/assign/ApiCaller_PermissionsGroup";
import {ApiCaller_PermissionsProject} from "../modules/manage/ApiCaller_PermissionsProject";
import {ApiCaller_PermissionsDomain} from "../modules/manage/ApiCaller_PermissionsDomain";
import {ApiCaller_PermissionsAccessLevel} from "../modules/manage/ApiCaller_PermissionsLevel";
import {ApiCaller_PermissionsApi} from "../modules/manage/ApiCaller_PermissionsApi";
import {ApiCaller_PermissionsTags} from "../modules/tags/ApiCaller_PermissionsTags";

export const Frontend_ModulePack_Permissions = [
    ApiCaller_PermissionsUser,
    ApiCaller_PermissionsGroup,
    ApiCaller_PermissionsProject,
    ApiCaller_PermissionsDomain,
    ApiCaller_PermissionsAccessLevel,
    ApiCaller_PermissionsApi,
    ApiCaller_PermissionsTags
];
