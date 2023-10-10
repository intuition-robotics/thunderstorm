import {AccessLevelPermissionsDB} from "./managment";
import {PermissionsShare} from "../permissions-share";
import {
    TypeValidator,
    validate,
    validateArray,
    validateObjectValues,
    validateRegexp
} from "@intuitionrobotics/ts-common/validator/validator";
import {
    batchAction,
    filterDuplicates,
    filterInstances,
    removeItemFromArray
} from "@intuitionrobotics/ts-common/utils/array-tools";
import {auditBy} from "@intuitionrobotics/ts-common/utils/date-time-tools";
import {_keys, compare} from "@intuitionrobotics/ts-common/utils/object-tools";
import {merge} from "@intuitionrobotics/ts-common/utils/merge-tools";
import {DB_PermissionAccessLevel} from "../../../shared/manager-types";
import {ApiException} from "@intuitionrobotics/thunderstorm/app-backend/exceptions";
import {
    BaseDB_ApiGenerator,
    validateStringAndNumbersWithDashes,
    validateUniqueId
} from "@intuitionrobotics/db-api-generator/app-backend/BaseDB_ApiGenerator";
import {DB_PermissionsGroup, DB_PermissionsUser} from "../../../shared/assign-types";
import {CollectionName_Groups, CollectionName_Users} from "../consts";
import {Clause_Where} from "@intuitionrobotics/firebase/shared/types";
import {FirestoreTransaction} from "@intuitionrobotics/firebase/app-backend/firestore/FirestoreTransaction";
import {ExpressRequest} from "@intuitionrobotics/thunderstorm/app-backend/utils/types";
import {
    AccountModule,
    OnNewUserRegistered,
    OnUserLogin
} from "@intuitionrobotics/user-account/app-backend/modules/AccountModule";
import {AssignAppPermissions, PredefinedGroup} from "../../../shared/apis";
import {UI_Account} from "@intuitionrobotics/user-account/shared/api";
import {BadImplementationException} from "@intuitionrobotics/ts-common/core/exceptions";

const validateUserUuid = validateRegexp(/^.{0,50}$/);
const validateGroupLabel = validateRegexp(/^[A-Za-z-\._ ]+$/);
const validateCustomFieldValues = validateRegexp(/^.{0,500}$/);

function checkDuplicateLevelsDomain(levels: DB_PermissionAccessLevel[]) {
    const domainIds = levels.map(level => level.domainId);
    const filteredDomainIds = filterDuplicates(domainIds);
    if (filteredDomainIds.length !== domainIds.length)
        throw new ApiException(422, 'You trying insert duplicate accessLevel with the same domain');
}

export class GroupsDB_Class
    extends BaseDB_ApiGenerator<DB_PermissionsGroup> {
    static _validator: TypeValidator<DB_PermissionsGroup> = {
        _id: validateStringAndNumbersWithDashes,
        label: validateGroupLabel,
        tags: undefined,
        accessLevelIds: validateArray(validateUniqueId, false),
        customFields: validateArray(validateObjectValues<string>(validateCustomFieldValues), false),
        __accessLevels: undefined,
        _audit: undefined
    };

    constructor() {
        super(CollectionName_Groups, GroupsDB_Class._validator, "group", "GroupsDB");
        this.setLockKeys(['__accessLevels']);
    }

    protected externalFilter(item: DB_PermissionsGroup): Clause_Where<DB_PermissionsGroup> {
        const {label} = item;
        return {label};
    }

    protected internalFilter(item: DB_PermissionsGroup): Clause_Where<DB_PermissionsGroup>[] {
        const {label} = item;
        return [{label}];
    }

    protected async assertDeletion(transaction: FirestoreTransaction, dbInstance: DB_PermissionsGroup): Promise<void> {
        const groups = await UserPermissionsDB.collection.query({where: {__groupIds: {$ac: dbInstance._id}}});

        if (groups.length) {
            throw new ApiException(403, 'You trying delete group that associated with users, you need delete this group from users first');
        }
    }

    private async setAccessLevels(dbInstance: DB_PermissionsGroup) {
        dbInstance.__accessLevels = [];
        const accessLevelIds = dbInstance.accessLevelIds || [];
        if (accessLevelIds.length) {
            const groupLevels = await batchAction(accessLevelIds, 10, (chunked) => {
                return AccessLevelPermissionsDB.query({where: {_id: {$in: chunked}}});
            });
            checkDuplicateLevelsDomain(groupLevels);
            dbInstance.__accessLevels = groupLevels.map(level => {
                return {domainId: level.domainId, value: level.value};
            });
        }
    }

    async getGroupsByTags(tags: string[]) {
        const groupsByTags = await this.collection.query({where: {tags: {$aca: tags}}});
        if (!groupsByTags)
            return [];
        return groupsByTags;
    }

    async deleteTags(tag: string) {
        const groupsWithTags: DB_PermissionsGroup[] | undefined = await this.collection.query({where: {tags: {$aca: [tag]}}});
        if (!groupsWithTags)
            return;
        for (const _group of groupsWithTags) {
            if (!_group.tags)
                continue;
            removeItemFromArray(_group.tags, tag);
            await this.collection.upsert(_group);
        }
    }

    protected async preUpsertProcessing(transaction: FirestoreTransaction, dbInstance: DB_PermissionsGroup, request?: ExpressRequest) {
        if (request) {
            const account = await AccountModule.validateSession(request);
            dbInstance._audit = auditBy(account.email);
        }

        if (!dbInstance.accessLevelIds)
            return;

        await this.setAccessLevels(dbInstance);
        const filterAccessLevelIds = filterDuplicates(dbInstance.accessLevelIds);
        if (filterAccessLevelIds.length !== dbInstance.accessLevelIds?.length)
            throw new ApiException(422, 'You trying insert duplicate accessLevel id in group');
    }

    getConfig() {
        return this.config;
    }

    getPredefinedGroupId(projectId: string, predefinedGroupId: string) {
        return `${projectId}--${predefinedGroupId}`;
    }

    upsertPredefinedGroups(projectId: string, projectName: string, predefinedGroups: PredefinedGroup[]) {
        return this.runInTransaction(async (transaction) => {
            const _groups = predefinedGroups.map(group => ({
                _id: this.getPredefinedGroupId(projectId, group._id),
                label: `${projectName}--${group.key}-${group.label}`
            }));

            const dbGroups = filterInstances(await batchAction(_groups.map(group => group._id), 10, (chunk) => {
                return transaction.query(this.collection, {where: {_id: {$in: chunk}}});
            }));

            //TODO patch the predefined groups, in case app changed the label of the group..
            const groupsToInsert = _groups.filter(group => !dbGroups.find(dbGroup => dbGroup._id === group._id));
            return this.upsertAll(groupsToInsert, transaction);
        });
    }

}

export class UsersDB_Class
    extends BaseDB_ApiGenerator<DB_PermissionsUser>
    implements OnNewUserRegistered, OnUserLogin {
    static _validator: TypeValidator<DB_PermissionsUser> = {
        _id: undefined,
        accountId: validateUserUuid,
        groups: validateArray({
            groupId: validateStringAndNumbersWithDashes,
            customField: validateObjectValues<string>(validateCustomFieldValues, false)
        }, false),
        __groupIds: validateArray(validateStringAndNumbersWithDashes, false),
        _audit: undefined
    };

    constructor() {
        super(CollectionName_Users, UsersDB_Class._validator, "user", "UsersDB");
        this.setLockKeys(["accountId"]);
    }

    protected async preUpsertProcessing(transaction: FirestoreTransaction, dbInstance: DB_PermissionsUser, request?: ExpressRequest): Promise<void> {
        if (request) {
            const account = await AccountModule.validateSession(request);
            dbInstance._audit = auditBy(account.email);
        }

        this.setGroupIds(dbInstance);
        const userGroupIds = filterDuplicates(dbInstance.groups?.map(group => group.groupId) || []);
        if (!userGroupIds.length)
            return;

        const userGroups = await batchAction(userGroupIds, 10, (chunked) => {
            return GroupPermissionsDB.query({where: {_id: {$in: chunked}}});
        });

        if (userGroupIds.length !== userGroups.length) {
            throw new ApiException(422, 'You trying upsert user with group that not found in group permissions db');
        }

        const userGroupsItems = dbInstance.groups || [];
        userGroupsItems.forEach((userGroupItem) => {
            userGroupsItems.forEach(innerUserGroupItem => {
                if (userGroupsItems.indexOf(userGroupItem) === userGroupsItems.indexOf(innerUserGroupItem))
                    return;

                if (compare(userGroupItem.groupId, innerUserGroupItem.groupId) && compare(userGroupItem.customField || {}, innerUserGroupItem.customField || {})) {
                    throw new ApiException(422, 'You trying upsert user with duplicate UserGroup (with the same groupId && customField)');
                }
            });
        });

    }

    protected internalFilter(item: DB_PermissionsUser): Clause_Where<DB_PermissionsUser>[] {
        const {accountId} = item;
        return [{accountId}];
    }

    private setGroupIds(dbInstance: DB_PermissionsUser) {
        dbInstance.__groupIds = [];
        const userGroups = dbInstance.groups || [];
        if (userGroups.length) {
            dbInstance.__groupIds = userGroups.map(userGroup => userGroup.groupId);
        }
    }

    async __onUserLogin(account: UI_Account) {
        await this.insertIfNotExist(account.email);
    }

    async __onNewUserRegistered(account: UI_Account) {
        await this.insertIfNotExist(account.email);
    }

    async insertIfNotExist(email: string) {
        return this.runInTransaction(async (transaction) => {

            const account = await AccountModule.getUser(email);
            if (!account)
                throw new ApiException(404, `user not found for email ${email}`);

            const users = await transaction.query(this.collection, {where: {accountId: account._id}});
            if (users.length)
                return;

            return this.upsert({accountId: account._id, groups: []}, transaction);
        });
    }

    async assignAppPermissions(assignAppPermissionsObj: AssignAppPermissions, request?: ExpressRequest) {
        const sharedUserIds = assignAppPermissionsObj.sharedUserIds || [];
        if (!sharedUserIds.length)
            throw new BadImplementationException("SharedUserIds is missing");

        const groupId = GroupPermissionsDB.getPredefinedGroupId(assignAppPermissionsObj.projectId, assignAppPermissionsObj.group._id);
        await PermissionsShare.verifyPermissionGrantingAllowed(assignAppPermissionsObj.granterUserId,
            {groupId, customField: assignAppPermissionsObj.customField});

        if (!assignAppPermissionsObj.groupsToRemove.find(groupToRemove => groupToRemove._id === assignAppPermissionsObj.group._id))
            throw new BadImplementationException("Group to must be a part of the groups to removed array");

        await this.runInTransaction(async (transaction) => {
            const users = await batchAction(sharedUserIds, 10, (chunked) => {
                return transaction.query(this.collection, {where: {accountId: {$in: chunked}}});
            });

            if (users.length !== sharedUserIds.length)
                throw new ApiException(404, `No permissions USER for all user ids`); // TODO mention who miss?


			if (!assignAppPermissionsObj.customField)
				throw new ApiException(400, `Cannot set app permissions '${assignAppPermissionsObj.projectId}--${assignAppPermissionsObj.group._id}', request must have custom fields restriction!!`);

            const _group = await transaction.queryUnique(GroupPermissionsDB.collection, {where: {_id: groupId}});
            if (!_group)
                throw new ApiException(404, `No permissions GROUP for id ${groupId}`);

            const updatedUsers = users.map(user => {
                const newGroups = (user.groups || [])?.filter(
                    group => !assignAppPermissionsObj.groupsToRemove.find(groupToRemove => {
                        if (GroupPermissionsDB.getPredefinedGroupId(assignAppPermissionsObj.projectId, groupToRemove._id) !== group.groupId)
                            return false;

                        return compare(group.customField, assignAppPermissionsObj.customField, assignAppPermissionsObj.assertKeys);
                    }));

                if (!newGroups.find(nGroup => nGroup.groupId === _group._id && compare(nGroup.customField, assignAppPermissionsObj.customField))) {
                    newGroups.push({groupId: _group._id, customField: assignAppPermissionsObj.customField});
                }

                user.groups = newGroups;
                return user;
            });

            return this.upsertAll(updatedUsers, transaction, request);
        });
    }

    async patch(instance: DB_PermissionsUser, propsToPatch?: (keyof DB_PermissionsUser)[], request?: ExpressRequest): Promise<DB_PermissionsUser> {
        return this.collection.runInTransaction(async (transaction) => {
            const dbInstance: DB_PermissionsUser = await this.assertExternalQueryUnique(instance, transaction);
            // If the caller has specified props to be changed, make sure the don't conflict with the lockKeys.
            const wrongKey = propsToPatch?.find(prop => this.config.lockKeys.includes(prop));
            if (wrongKey)
                throw new BadImplementationException(`Key ${wrongKey} is part of the 'lockKeys' and cannot be updated.`);

            // If the caller has not specified props, we remove the keys from the caller's instance
            // before merging with the original dbInstance.
            _keys(instance).forEach(key => {
                if (this.config.lockKeys.includes(key) || (propsToPatch && !propsToPatch.includes(key))) {
                    delete instance[key];
                }
            });

            if (instance.groups && instance.groups.length < (dbInstance.groups?.length || 0)) {
                await AccountModule.logoutAccount(dbInstance.accountId)
            }

            const mergedObject = merge(dbInstance, instance);

            await validate(mergedObject, this.validator);

            await this.assertUniqueness(transaction, mergedObject, request);

            return this.upsertImpl(transaction, mergedObject, request);
        });
    }
}

export const GroupPermissionsDB = new GroupsDB_Class();
export const UserPermissionsDB = new UsersDB_Class();
