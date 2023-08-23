import {DB_RequestObject} from "@intuitionrobotics/firebase/shared/types";
import {Auditable, DB_Object} from "@intuitionrobotics/ts-common/utils/types";

export type Request_CreateDomain = DB_RequestObject & {
    projectId: string
    namespace: string
}

export type DB_PermissionDomain = DB_Object & Request_CreateDomain & Auditable;

export type Request_CreateProject = DB_RequestObject & {
    name: string,
    customKeys?: string[]
}

export type DB_PermissionProject = DB_Object & Request_CreateProject & Auditable


export type Request_CreateLevel = DB_RequestObject & {
    domainId: string
    name: string
    value: number
}

export type DB_PermissionAccessLevel = DB_Object & Request_CreateLevel & Auditable


export type Request_UpdateApiPermissions = DB_RequestObject & {
    projectId: string
    path: string
    accessLevelIds?: string[],
    deprecated?: boolean,
    onlyForApplication?: boolean
}


export type DB_PermissionApi = DB_Object & Request_UpdateApiPermissions & Auditable
