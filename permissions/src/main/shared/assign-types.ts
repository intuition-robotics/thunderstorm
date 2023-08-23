import {Auditable, DB_Object, StringMap} from "@intuitionrobotics/ts-common/utils/types";

export type Base_AccessLevels = {
    domainId: string,
    value: number
}

export type DB_GroupTags = DB_Object & {
    label: string
}

export type Request_CreateGroup = {
    label: string,
    tags?: string[],
    accessLevelIds?: string[],
    __accessLevels?: Base_AccessLevels[],
    customFields?: StringMap[]
};

export type DB_PermissionsGroup = DB_Object & Request_CreateGroup & Auditable;

export type User_Group = {
    groupId: string,
    customField?: StringMap
}

export type Request_CreateUser = {
    accountId: string,
    groups?: User_Group[],
    __groupIds?: string[]
};

export type DB_PermissionsUser = DB_Object & Request_CreateUser & Auditable
