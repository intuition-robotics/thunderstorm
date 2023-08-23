import {BaseDB_ApiGenerator} from "./BaseDB_ApiGenerator";
import {DB_Object} from "@intuitionrobotics/ts-common/utils/types"
import {
    ApiBinder_DBCreate,
    ApiBinder_DBDelete,
    ApiBinder_DBQuery,
    ApiBinder_DBUniuqe,
    ApiBinder_DBUpdate,
    DefaultApiDefs,
    GenericApiDef
} from "../shared/types";
import {ApiResponse, ServerApi} from "@intuitionrobotics/thunderstorm/app-backend/modules/server/server-api";
import {
    ApiTypeBinder,
    DeriveBodyType,
    DeriveQueryType,
    DeriveResponseType,
    QueryParams,
} from "@intuitionrobotics/thunderstorm/shared/types";
import {ExpressRequest} from "@intuitionrobotics/thunderstorm/app-backend/utils/types";
import {Clause_Where, FirestoreQuery} from "@intuitionrobotics/firebase/shared/types";

export function resolveUrlPart(dbModule: BaseDB_ApiGenerator<any>, pathPart?: string, pathSuffix?: string) {
    return `${!pathPart ? dbModule.getItemName() : pathPart}${pathSuffix ? "/" + pathSuffix : ""}`;
}

export abstract class GenericServerApi<DBType extends DB_Object, Binder extends ApiTypeBinder<string, R, B, P>, PostProcessor = never, R = DeriveResponseType<Binder>, B = DeriveBodyType<Binder>, P extends QueryParams | {} = DeriveQueryType<Binder>>
    extends ServerApi<Binder> {

    protected readonly dbModule: BaseDB_ApiGenerator<DBType>;
    protected readonly postProcessors: PostProcessor[] = [];

    protected constructor(dbModule: BaseDB_ApiGenerator<DBType>, def: GenericApiDef, pathPart?: string) {
        super(def.method, resolveUrlPart(dbModule, pathPart, def.suffix));
        this.dbModule = dbModule;
    }

    addPostProcessor(processor: PostProcessor) {
        this.postProcessors.push(processor)
    }

    // protected async process(request: ExpressRequest, response: ApiResponse, queryParams: DeriveQueryType<Binder>, body: DeriveBodyType<Binder>): Promise<DeriveResponseType<Binder>> {
    // 	const toRet = await this._process(request, response, queryParams as P, body as B);
    //
    // 	return toRet as DeriveResponseType<Binder>;
    // }
    //
    // protected abstract async _process(request: ExpressRequest, response: ApiResponse, queryParams: P, body: B): Promise<R>;

}

export class ServerApi_Create<DBType extends DB_Object>
    extends GenericServerApi<DBType, ApiBinder_DBCreate<DBType>, (item: DBType) => DBType> {

    constructor(dbModule: BaseDB_ApiGenerator<DBType>, pathPart?: string) {
        super(dbModule, DefaultApiDefs.Create, pathPart);
    }

    protected async process(request: ExpressRequest, response: ApiResponse, queryParams: {}, body: Omit<DBType, "_id">) {
        let toRet = await this.dbModule.upsert(body, undefined, request);
        for (const postProcessor of this.postProcessors) {
            toRet = await postProcessor(toRet);
        }
        return toRet;
    }
}

export class ServerApi_Update<DBType extends DB_Object>
    extends GenericServerApi<DBType, ApiBinder_DBUpdate<DBType>> {

    constructor(dbModule: BaseDB_ApiGenerator<DBType>, pathPart?: string) {
        super(dbModule, DefaultApiDefs.Update, pathPart);
    }

    protected async process(request: ExpressRequest, response: ApiResponse, queryParams: {}, body: DBType): Promise<DBType> {
        return this.dbModule.patch(body, undefined, request);
    }
}

export class ServerApi_Unique<DBType extends DB_Object>
    extends GenericServerApi<DBType, ApiBinder_DBUniuqe<DBType>> {

    constructor(dbModule: BaseDB_ApiGenerator<DBType>, pathPart?: string) {
        super(dbModule, DefaultApiDefs.Unique, pathPart);
    }

    protected async process(request: ExpressRequest, response: ApiResponse, queryParams: DB_Object, body: void): Promise<DBType> {
        return this.dbModule.queryUnique(queryParams as Clause_Where<DBType>, request);
    }
}

export class ServerApi_Query<DBType extends DB_Object>
    extends GenericServerApi<DBType, ApiBinder_DBQuery<DB_Object>, () => Promise<Partial<DBType>[]>> {

    constructor(dbModule: BaseDB_ApiGenerator<DBType>, pathPart?: string) {
        super(dbModule, DefaultApiDefs.Query, pathPart);
    }

    protected async process(request: ExpressRequest, response: ApiResponse, queryParams: {}, _body: Partial<DBType>): Promise<DBType[]> {
        // for (const postProcessor of this.postProcessors) {
        // 	queries = await postProcessor();
        // }

        return this.dbModule.query({where: _body} as FirestoreQuery<DBType>, request);
    }
}

export class ServerApi_Delete<DBType extends DB_Object>
    extends GenericServerApi<DBType, ApiBinder_DBDelete<DBType>> {

    constructor(dbModule: BaseDB_ApiGenerator<DBType>, pathPart?: string) {
        super(dbModule, DefaultApiDefs.Delete, pathPart);
    }

    protected async process(request: ExpressRequest, response: ApiResponse, queryParams: DB_Object, body: void) {
        return this.dbModule.deleteUnique(queryParams._id, undefined, request);
    }
}
