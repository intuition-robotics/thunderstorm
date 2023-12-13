import {DB_Object, Clause_Where} from "@intuitionrobotics/firebase";
import {ApiWithBody, ApiWithQuery, HttpMethod} from "@intuitionrobotics/thunderstorm";

export const DefaultApiDefs: { [k: string]: GenericApiDef; } = {
    Create: {
        method: HttpMethod.POST,
        key: "create",
        suffix: "create"
    },
    Update: {
        method: HttpMethod.POST,
        key: "update",
        suffix: "update"
    },
    Delete: {
        method: HttpMethod.GET, // delete doesn't works, so we changed it to get
        key: "delete",
        suffix: "delete"
    },
    Unique: {
        method: HttpMethod.GET,
        key: "unique",
        suffix: "unique"
    },
    Query: {
        method: HttpMethod.POST,
        key: "query",
        suffix: "query"
    },
};

export const ErrorKey_BadInput = "bad-input";

export type BadInputErrorBody = { path: string, input?: string };

export type GenericApiDef = { method: HttpMethod, key: string, suffix?: string };

export type ApiBinder_DBCreate<DBType extends DB_Object, RequestType extends Omit<DBType, "_id"> = Omit<DBType, "_id">> = ApiWithBody<string, RequestType, DBType>;
export type ApiBinder_DBDelete<DBType extends DB_Object> = ApiWithQuery<string, DBType, DB_Object>;
export type ApiBinder_DBUniuqe<DBType extends DB_Object> = ApiWithQuery<string, DBType, DB_Object>;
export type ApiBinder_DBUpdate<DBType extends DB_Object> = ApiWithBody<string, DBType, DBType>;
export type ApiBinder_DBQuery<DBType extends DB_Object> = ApiWithBody<string, Clause_Where<DBType>, DBType[]>;

