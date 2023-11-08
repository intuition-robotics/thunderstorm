/*
 * ts-common is the basic building blocks of our typescript projects
 *
 * Copyright (C) 2020 Intuition Robotics
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {arrayToMap, batchActionParallel, ImplementationMissingException, Module, StringMap} from "@intuitionrobotics/ts-common";
import {
    DB_PermissionProject,
    DB_PermissionsUser,
    PredefinedGroup,
    PredefinedUser,
    Request_RegisterProject,
    Response_UsersCFsByShareGroups,
    UserUrlsPermissions
} from "./_imports";
import {PermissionsAssert} from "./permissions-assert";
import {ApiPermissionsDB, ProjectPermissionsDB} from "./db-types/managment";
import {HttpServer_Class} from "@intuitionrobotics/thunderstorm/backend";
import {GroupPermissionsDB, UserPermissionsDB} from "./db-types/assign";
import {AccountModule} from "@intuitionrobotics/user-account/backend";
import {UI_Account} from "@intuitionrobotics/user-account/shared/api";

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
        const accounts = await AccountModule.getUsers(usersEmails);
        const usersMap: { [email: string]: UI_Account } = arrayToMap(accounts, u => u.email);
        const permissionUsers = await batchActionParallel(accounts.map(u => u._id), 10, async (batchedAccountIds) => {
            return UserPermissionsDB.query({
                where: {
                    accountId: {
                        $in: batchedAccountIds
                    }
                },
                select: ['_id', 'groups']
            })
        });
        const permissionUsersMap = arrayToMap(permissionUsers, pu => pu._id);
        return usersEmails.reduce((acc: Response_UsersCFsByShareGroups, e) => {
            const account = usersMap[e.toLowerCase()];
            if (!account)
                return acc;

            const user = permissionUsersMap[account._id];
            if (!user)
                return acc;

            acc[e] = this.getCustomFields(user, groupsIds);
            return acc;
        }, {})
    }

    async getUserCFsByShareGroups(userId: string, groupsIds: string[]): Promise<StringMap[]> {
        const user = await UserPermissionsDB.queryUnique({accountId: userId});
        return this.getCustomFields(user, groupsIds);
    }

    private getCustomFields(user: DB_PermissionsUser, groupsIds: string[]): StringMap[] {
        if (!user.groups)
            return [];

        return user.groups.reduce((acc:StringMap[], userGroup) => {
            if (!groupsIds.find(groupId => groupId === userGroup.groupId))
                return acc;

            if (!userGroup.customField)
                return acc;

            acc.push(userGroup.customField);
            return acc;
        }, []);
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
