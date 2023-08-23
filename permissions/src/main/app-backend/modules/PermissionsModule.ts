import {PermissionsAssert} from "./permissions-assert";
import {ApiPermissionsDB, ProjectPermissionsDB} from "./db-types/managment";
import {GroupPermissionsDB, UserPermissionsDB} from "./db-types/assign";
import {DB_PermissionProject} from "../../shared/manager-types";
import {
    PredefinedGroup,
    PredefinedUser,
    Request_RegisterProject,
    Response_UsersCFsByShareGroups,
    UserUrlsPermissions
} from "../../shared/apis";
import {Module} from "@intuitionrobotics/ts-common/core/module";
import {ImplementationMissingException} from "@intuitionrobotics/ts-common/core/exceptions";
import {StringMap} from "@intuitionrobotics/ts-common/utils/types";
import {AccountModule} from "@intuitionrobotics/user-account/app-backend/modules/AccountModule";
import {HttpServer_Class} from "@intuitionrobotics/thunderstorm/app-backend/modules/server/HttpServer";

type Config = {
    project: DB_PermissionProject
    predefinedGroups?: PredefinedGroup[],
    predefinedUser?: PredefinedUser
}

export class PermissionsModule_Class
    extends Module<Config> {

    constructor() {
        super("PermissionsModule");
    }

    protected init(): void {
        if (!this.config)
            throw new ImplementationMissingException("MUST set config with project identity!!");
    }

    getProjectIdentity = () => this.config.project;

    async getUserUrlsPermissions(projectId: string, urlsMap: UserUrlsPermissions, userId: string, requestCustomField: StringMap) {
        const urls = Object.keys(urlsMap);
        const [userDetails, apiDetails] = await Promise.all(
            [
                PermissionsAssert.getUserDetails(userId),
                PermissionsAssert.getApisDetails(urls, projectId)
            ]
        );

        return urls.reduce((userUrlsPermissions: UserUrlsPermissions, url, i) => {
            const apiDetail = apiDetails[i];
            if (apiDetail) {
                try {
                    PermissionsAssert._assertUserPermissionsImpl(apiDetail, projectId, userDetails, requestCustomField);
                    userUrlsPermissions[url] = true;
                } catch (e) {
                    userUrlsPermissions[url] = false;
                }
            } else
                userUrlsPermissions[url] = false;

            return userUrlsPermissions;
        }, {});
    }

    async getUsersCFsByShareGroups(usersEmails: string[], groupsIds: string[]): Promise<Response_UsersCFsByShareGroups> {
        const toRet: Response_UsersCFsByShareGroups = {};
        await Promise.all(usersEmails.map(async email => {
            const account = await AccountModule.getUser(email);
            if (!account)
                return;

            toRet[email] = await this.getUserCFsByShareGroups(account._id, groupsIds);
        }));

        return toRet;
    }

    async getUserCFsByShareGroups(userId: string, groupsIds: string[]): Promise<StringMap[]> {
        const user = await UserPermissionsDB.queryUnique({accountId: userId});
        const userCFs: StringMap[] = [];
        if (!user.groups)
            return userCFs;

        user.groups.forEach(userGroup => {
            if (!groupsIds.find(groupId => groupId === userGroup.groupId))
                return;

            if (!userGroup.customField)
                return;

            userCFs.push(userGroup.customField);
        });

        return userCFs;
    }

    async registerProject(server: HttpServer_Class) {
        const routes: string[] = server.getRoutes().reduce((carry: string[], httpRoute) => {
            if (httpRoute.path !== "*")
                carry.push(httpRoute.path);

            return carry;
        }, []);

        const projectRoutes = {
            project: PermissionsModule.getProjectIdentity(),
            routes,
            predefinedGroups: this.config.predefinedGroups,
            predefinedUser: this.config.predefinedUser
        };

        return this._registerProject(projectRoutes);
    }

    async _registerProject(registerProject: Request_RegisterProject) {
        const project = registerProject.project;
        await ProjectPermissionsDB.upsert(project);
        await ApiPermissionsDB.registerApis(project._id, registerProject.routes);
        const predefinedGroups = registerProject.predefinedGroups;
        if (!predefinedGroups || predefinedGroups.length === 0)
            return;

        await GroupPermissionsDB.upsertPredefinedGroups(project._id, project.name, predefinedGroups);

        const predefinedUser = registerProject.predefinedUser;
        if (!predefinedUser)
            return;

        const groupsUser = predefinedUser.groups.map(groupItem => {
            const customField: StringMap = {};
            const allRegEx = ".*";
            if (!groupItem.customKeys || !groupItem.customKeys.length)
                customField["_id"] = allRegEx;
            else {
                groupItem.customKeys.forEach((customKey) => {
                    customField[customKey] = allRegEx;
                });
            }

            return {
                groupId: GroupPermissionsDB.getPredefinedGroupId(project._id, groupItem._id),
                customField
            };
        });
        await UserPermissionsDB.upsert({...predefinedUser, groups: groupsUser});
    }
}

export const PermissionsModule = new PermissionsModule_Class();
