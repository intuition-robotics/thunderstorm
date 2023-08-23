import {
    TypeValidator,
    validateArray,
    validateRange,
    validateRegexp
} from "@intuitionrobotics/ts-common/validator/validator";
import {filterDuplicates} from "@intuitionrobotics/ts-common/utils/array-tools";
import {auditBy} from "@intuitionrobotics/ts-common/utils/date-time-tools";
import {
    DB_PermissionAccessLevel,
    DB_PermissionApi,
    DB_PermissionDomain,
    DB_PermissionProject,
    Request_UpdateApiPermissions
} from "../../../shared/manager-types";
import {ApiException} from "@intuitionrobotics/thunderstorm/app-backend/exceptions";
import {
    BaseDB_ApiGenerator,
    validateNameWithDashesAndDots,
    validateOptionalId,
    validateStringWithDashes,
    validateUniqueId
} from "@intuitionrobotics/db-api-generator/app-backend/BaseDB_ApiGenerator";
import {CollectionName_Api, CollectionName_Domain, CollectionName_Level, CollectionName_Projects} from "../consts";
import {Clause_Where} from "@intuitionrobotics/firebase/shared/types";
import {FirestoreTransaction} from "@intuitionrobotics/firebase/app-backend/firestore/FirestoreTransaction";
import {ExpressRequest} from "@intuitionrobotics/thunderstorm/app-backend/utils/types";
import {AccountModule} from "@intuitionrobotics/user-account/app-backend/modules/AccountModule";
import {
    ServerApi_Delete,
    ServerApi_Query,
    ServerApi_Unique,
    ServerApi_Update
} from "@intuitionrobotics/db-api-generator/app-backend/apis";
import {ServerApi} from "@intuitionrobotics/thunderstorm/app-backend/modules/server/server-api";
import {GroupPermissionsDB} from "./assign";
import {Request_CreateGroup} from "../../../shared/assign-types";
import {MUSTNeverHappenException} from "@intuitionrobotics/ts-common/core/exceptions";

const validateProjectId = validateRegexp(/^[a-z-]{3,20}$/);
export const validateProjectName = validateRegexp(/^[A-Za-z- ]{3,20}$/);
export const validateStringWithDashesAndSlash = validateRegexp(/^[0-9A-Za-z-:/]+$/);

export class ProjectDB_Class
    extends BaseDB_ApiGenerator<DB_PermissionProject> {
    static _validator: TypeValidator<DB_PermissionProject> = {
        _id: validateProjectId,
        name: validateProjectName,
        customKeys: undefined,
        _audit: undefined
    };

    constructor() {
        super(CollectionName_Projects, ProjectDB_Class._validator, "project", "ProjectDB");
    }

    protected async preUpsertProcessing(transaction: FirestoreTransaction, dbInstance: DB_PermissionProject, request?: ExpressRequest): Promise<void> {
        if (request) {
            const account = await AccountModule.validateSession(request);
            dbInstance._audit = auditBy(account.email);
        }
    }

    apis(pathPart?: string): ServerApi<any>[] {
        return [
            new ServerApi_Query(this, pathPart),
            new ServerApi_Unique(this, pathPart),
        ];
    }
}


export class DomainDB_Class
    extends BaseDB_ApiGenerator<DB_PermissionDomain> {
    static _validator: TypeValidator<DB_PermissionDomain> = {
        _id: validateOptionalId,
        projectId: validateProjectId,
        namespace: validateNameWithDashesAndDots,
        _audit: undefined
    };

    constructor() {
        super(CollectionName_Domain, DomainDB_Class._validator, "domain", "DomainDB");
        this.setLockKeys(['projectId']);
    }

    protected async assertDeletion(transaction: FirestoreTransaction, dbInstance: DB_PermissionDomain) {
        const accessLevels = await AccessLevelPermissionsDB.query({where: {domainId: dbInstance._id}});
        if (accessLevels.length) {
            throw new ApiException(403, 'You trying delete domain that associated with accessLevels, you need delete the accessLevels first');
        }
    }

    protected async preUpsertProcessing(transaction: FirestoreTransaction, dbInstance: DB_PermissionDomain, request?: ExpressRequest) {
        await ProjectPermissionsDB.queryUnique({_id: dbInstance.projectId});

        if (request) {
            const account = await AccountModule.validateSession(request);
            dbInstance._audit = auditBy(account.email);
        }
    }
}


export class LevelDB_Class
    extends BaseDB_ApiGenerator<DB_PermissionAccessLevel> {
    static _validator: TypeValidator<DB_PermissionAccessLevel> = {
        _id: validateOptionalId,
        domainId: validateUniqueId,
        name: validateStringWithDashes,
        value: validateRange([[0, 1000]]),
        _audit: undefined
    };

    constructor() {
        super(CollectionName_Level, LevelDB_Class._validator, "level", "LevelDB");
        this.setLockKeys(['domainId']);
    }

    protected internalFilter(item: DB_PermissionAccessLevel): Clause_Where<DB_PermissionAccessLevel>[] {
        const {domainId, name, value} = item;
        return [{domainId, name}, {domainId, value}];
    }

    protected async preUpsertProcessing(transaction: FirestoreTransaction, dbInstance: DB_PermissionAccessLevel, request?: ExpressRequest) {
        await DomainPermissionsDB.queryUnique({_id: dbInstance.domainId});

        if (request) {
            const account = await AccountModule.validateSession(request);
            dbInstance._audit = auditBy(account.email);
        }
    }

    protected async upsertImpl_Read(transaction: FirestoreTransaction, dbInstance: DB_PermissionAccessLevel, request: ExpressRequest): Promise<() => DB_PermissionAccessLevel> {
        const existDbLevel = await transaction.queryUnique(this.collection, {where: {_id: dbInstance._id}});
        const groups = await GroupPermissionsDB.query({where: {accessLevelIds: {$ac: dbInstance._id}}});
        const returnWrite = await super.upsertImpl_Read(transaction, dbInstance, request);
        if (existDbLevel) {
            const callbackfn = (group: Request_CreateGroup) => {
                const index = group.accessLevelIds?.indexOf(dbInstance._id);
                if (index === undefined)
                    throw new MUSTNeverHappenException("Query said it does exists!!");

                const accessLevel = group.__accessLevels?.[index];
                if (accessLevel === undefined)
                    throw new MUSTNeverHappenException("Query said it does exists!!");

                accessLevel.value = dbInstance.value;
            };

            const asyncs = [];
            asyncs.push(...groups.map(async group => {
                await GroupPermissionsDB.validateImpl(group);
                await GroupPermissionsDB.assertUniqueness(transaction, group);
                callbackfn(group);
            }));

            const upsertGroups = await transaction.upsertAll_Read(GroupPermissionsDB.collection, groups);
            await Promise.all(asyncs);

            // --- writes part
            upsertGroups();
        }

        return returnWrite;
    }

    protected async assertDeletion(transaction: FirestoreTransaction, dbInstance: DB_PermissionAccessLevel) {
        const groups = await GroupPermissionsDB.query({where: {accessLevelIds: {$ac: dbInstance._id}}});
        const apis = await ApiPermissionsDB.query({where: {accessLevelIds: {$ac: dbInstance._id}}});

        if (groups.length || apis.length)
            throw new ApiException(403, 'You trying delete access level that associated with users/groups/apis, you need delete the associations first');
    }

    setUpdatedLevel(dbLevel: DB_PermissionAccessLevel, units: Request_CreateGroup[]) {
        units.forEach(unit => {
            let hasGroupDomainLevel = false;
            const updatedLevels = unit.__accessLevels?.map(level => {
                if (level.domainId === dbLevel.domainId) {
                    level.value = dbLevel.value;
                    hasGroupDomainLevel = true;
                }
                return level;
            }) || [];

            if (!hasGroupDomainLevel) {
                updatedLevels.push({domainId: dbLevel.domainId, value: dbLevel.value});
            }

            unit.__accessLevels = updatedLevels;
        });
    }
}

export class ApiDB_Class
    extends BaseDB_ApiGenerator<DB_PermissionApi> {

    static _validator: TypeValidator<DB_PermissionApi> = {
        _id: validateOptionalId,
        projectId: validateProjectId,
        path: validateStringWithDashesAndSlash,
        accessLevelIds: validateArray(validateUniqueId, false),
        _audit: undefined,
        deprecated: undefined,
        onlyForApplication: undefined
    };

    constructor() {
        super(CollectionName_Api, ApiDB_Class._validator, "api", "ApiDB");
        this.setLockKeys(['projectId', "path"]);
    }

    protected externalFilter(item: DB_PermissionApi): Clause_Where<DB_PermissionApi> {
        const {projectId, path} = item;
        return {projectId, path};
    }

    protected internalFilter(item: DB_PermissionApi): Clause_Where<DB_PermissionApi>[] {
        const {projectId, path} = item;
        return [{projectId, path}];
    }

    protected async preUpsertProcessing(transaction: FirestoreTransaction, dbInstance: DB_PermissionApi, request?: ExpressRequest) {
        if (request) {
            const account = await AccountModule.validateSession(request);
            dbInstance._audit = auditBy(account.email);
        }

        await ProjectPermissionsDB.queryUnique({_id: dbInstance.projectId});

        // need to assert that all the permissions levels exists in the db
        const _permissionsIds = dbInstance.accessLevelIds;
        if (!_permissionsIds || _permissionsIds.length <= 0)
            return;

        const permissionsIds = filterDuplicates(_permissionsIds);
        await Promise.all(permissionsIds.map(id => AccessLevelPermissionsDB.queryUnique({_id: id})));
        dbInstance.accessLevelIds = permissionsIds;
    }

    registerApis(projectId: string, routes: string[]) {
        return this.runInTransaction(async (transaction: FirestoreTransaction) => {
            const existingProjectApis = await ApiPermissionsDB.query({where: {projectId: projectId}});
            const apisToAdd: Request_UpdateApiPermissions[] = routes
                .filter(path => !existingProjectApis.find(api => api.path === path))
                .map(path => ({path, projectId: projectId}));

            return this.upsertAll(apisToAdd, transaction);
        });
    }

    apis(pathPart?: string): ServerApi<any>[] {
        return [
            new ServerApi_Delete(this, pathPart),
            new ServerApi_Query(this, pathPart),
            new ServerApi_Unique(this, pathPart),
            new ServerApi_Update(this, pathPart),
        ];
    }
}


export const ProjectPermissionsDB = new ProjectDB_Class();
export const DomainPermissionsDB = new DomainDB_Class();
export const AccessLevelPermissionsDB = new LevelDB_Class();
export const ApiPermissionsDB = new ApiDB_Class();
