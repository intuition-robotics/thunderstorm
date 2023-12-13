import {ApiTypeBinder, BaseHttpRequest, ErrorResponse, QueryParams, RequestErrorHandler} from "@intuitionrobotics/thunderstorm";
import {ApiBinder_DBCreate, ApiBinder_DBDelete, ApiBinder_DBQuery, ApiBinder_DBUniuqe, DefaultApiDefs, GenericApiDef} from "../index";
import {Clause_Where, DB_Object} from "@intuitionrobotics/firebase";
import {ThunderDispatcher, XhrHttpModule} from "@intuitionrobotics/thunderstorm/frontend";

import {addItemToArray, Module, PartialProperties, removeItemFromArray} from "@intuitionrobotics/ts-common";

export type BaseApiConfig = {
    relativeUrl: string
    key: string
}

export abstract class BaseDB_ApiGeneratorCaller<DBType extends DB_Object, UType extends PartialProperties<DBType, "_id"> = PartialProperties<DBType, "_id">>
    extends Module<BaseApiConfig> {

    private readonly errorHandler: RequestErrorHandler<any> = (request: BaseHttpRequest<any>, resError?: ErrorResponse<any>) => {
        if (this.onError(request, resError))
            return;

        return XhrHttpModule.handleRequestFailure(request, resError);
    };

    private defaultDispatcher?: ThunderDispatcher<any, string>;

    // noinspection TypeScriptAbstractClassConstructorCanBeMadeProtected
    constructor(config: BaseApiConfig, moduleName: string) {
        super(moduleName);
        this.setDefaultConfig(config);
    }

    setDefaultDispatcher(defaultDispatcher: ThunderDispatcher<any, string>) {
        this.defaultDispatcher = defaultDispatcher;
    }

    protected createRequest<Binder extends ApiTypeBinder<U, R, B, P, any>,
        U extends string = Binder["url"],
        R = Binder["response"],
        B = Binder["body"],
        P extends QueryParams = Binder["queryParams"]>(apiDef: GenericApiDef): BaseHttpRequest<Binder> {
        const request = XhrHttpModule
            .createRequest(apiDef.method, this.getRequestKey(apiDef))
            .setRelativeUrl(`${this.config.relativeUrl}${apiDef.suffix ? "/" + apiDef.suffix : ""}`)
            .setOnError(this.errorHandler) as BaseHttpRequest<any>;

        const timeout = this.timeoutHandler(apiDef);
        if (timeout)
            request.setTimeout(timeout);

        return request;
    }

    public getRequestKey(apiDef: GenericApiDef) {
        return `request-api--${this.config.key}-${apiDef.key}`;
    }

    protected timeoutHandler(apiDef: GenericApiDef): number | void {
    }

    protected onError(request: BaseHttpRequest<any>, resError?: ErrorResponse<any>): boolean {
        return false;
    }

    create(toCreate: UType): BaseHttpRequest<ApiBinder_DBCreate<DBType>> {
        return this
            .createRequest<ApiBinder_DBCreate<DBType>>(DefaultApiDefs.Create)
            .setJsonBody(toCreate)
            .execute(async (response: DBType) => {
                return this.onEntryCreated(response);
            });
    }

    update = (toUpdate: DBType): BaseHttpRequest<ApiBinder_DBCreate<DBType>> => {
        return this
            .createRequest<ApiBinder_DBCreate<DBType>>(DefaultApiDefs.Update)
            .setJsonBody(toUpdate)
            .execute(async response => {
                return this.onEntryUpdated(response);
            });
    };

    query = (query?: Clause_Where<DBType>): BaseHttpRequest<ApiBinder_DBQuery<DBType>> => {
        let _query = query;
        if (!_query)
            _query = {} as Clause_Where<DBType>;

        return this
            .createRequest<ApiBinder_DBQuery<DBType>>(DefaultApiDefs.Query)
            .setJsonBody(_query)
            .execute(async response => {
                return this.onQueryReturned(response);
            });
    };

    unique = (_id: string): BaseHttpRequest<ApiBinder_DBUniuqe<DBType>> => {
        return this
            .createRequest<ApiBinder_DBUniuqe<DBType>>(DefaultApiDefs.Unique)
            .setUrlParams({_id})
            .execute(async response => {
                return this.onGotUnique(response);
            });
    };

    delete = (_id: string): BaseHttpRequest<ApiBinder_DBDelete<DBType>> => {
        return this
            .createRequest<ApiBinder_DBDelete<DBType>>(DefaultApiDefs.Delete)
            .setUrlParams({_id})
            .execute(async response => {
                return this.onEntryDeleted(response);
            });
    };

    private ids: string[] = [];
    private items: { [k: string]: DBType } = {};

    public getItems() {
        return this.ids.map(id => this.items[id]);
    }

    public get(id: string): DBType | undefined {
        return this.items[id];
    }

    protected async onEntryCreated(item: DBType): Promise<void> {
        this.upsertId(item._id);
        this.items[item._id] = item;
        this.dispatch();
    }

    private dispatch = () => {
        this.defaultDispatcher?.dispatchUI();
        this.defaultDispatcher?.dispatchModule();
    };

    protected async onEntryDeleted(item: DBType): Promise<void> {
        removeItemFromArray(this.ids, item._id);
        delete this.items[item._id];

        this.dispatch();
    }

    protected async onEntryUpdated(item: DBType): Promise<void> {
        this.items[item._id] = item;
        this.dispatch();
    }

    protected async onGotUnique(item: DBType): Promise<void> {
        if (!this.ids.includes(item._id))
            addItemToArray(this.ids, item._id);

        this.items[item._id] = item;
        this.dispatch();
    }

    protected async onQueryReturned(items: DBType[]): Promise<void> {
        items.forEach(item => this.upsertId(item._id));
        this.items = items.reduce((toRet, item) => {
            toRet[item._id] = item;
            return toRet;
        }, this.items);

        this.dispatch();
    }

    private upsertId = (id: string) => {
        if (!this.ids.includes(id))
            addItemToArray(this.ids, id);
    };
}
