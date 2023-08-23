import {Stream} from "stream";
import {parse} from "url";
import {ServerApi_Middleware} from "./HttpServer";
import {IncomingHttpHeaders} from "http";
import {
    ApiTypeBinder,
    ApiWithBody,
    ApiWithQuery,
    DeriveBodyType,
    DeriveQueryType,
    DeriveResponseType,
    DeriveUrlType,
    HttpMethod,
    QueryParams
} from "../../../shared/types";
import {assertProperty} from "../../utils/to-be-removed";
import {ApiException} from "../../exceptions";
import {ExpressRequest, ExpressResponse, ExpressRouter} from "../../utils/types";
import {RemoteProxy} from "../proxy/RemoteProxy";
import {Storm} from "../../core/Storm";
import {Logger} from "@intuitionrobotics/ts-common/core/logger/Logger";
import {validate, ValidationException, ValidatorTypeResolver} from "@intuitionrobotics/ts-common/validator/validator";
import {LogLevel} from "@intuitionrobotics/ts-common/core/logger/types";
import {dispatch_onServerError, ServerErrorSeverity} from "@intuitionrobotics/ts-common/core/error-handling";
import {
    BadImplementationException,
    isErrorOfType,
    MUSTNeverHappenException
} from "@intuitionrobotics/ts-common/core/exceptions";
import {ObjectTS} from "@intuitionrobotics/ts-common/utils/types";
import {merge} from "@intuitionrobotics/ts-common/utils/merge-tools";
import {_keys} from "@intuitionrobotics/ts-common/utils/object-tools";

export type HttpRequestData = {
    originalUrl: string
    headers: IncomingHttpHeaders
    url: string
    query: any
    body: any
    method: HttpMethod
}


export abstract class ServerApi<Binder extends ApiTypeBinder<string, R, B, P>, R = DeriveResponseType<Binder>, B = DeriveBodyType<Binder>, P extends QueryParams | {} = DeriveQueryType<Binder>>
    extends Logger {
    public static isDebug: boolean;

    private printResponse: boolean = true;
    readonly headersToLog: string[] = [];

    readonly method: HttpMethod;
    private url!: string;
    readonly relativePath: string;
    private middlewares?: ServerApi_Middleware[];
    private bodyValidator?: ValidatorTypeResolver<B>;
    private queryValidator?: ValidatorTypeResolver<P>;
    private sideEffects: (() => Promise<any>)[] = [];
    protected baseUrl?: string;

    protected constructor(method: HttpMethod, relativePath: string, tag?: string) {
        super(tag || relativePath);
        this.setMinLevel(ServerApi.isDebug ? LogLevel.Verbose : LogLevel.Info);

        this.method = method;
        this.relativePath = `${relativePath}`;
    }

    shouldPrintResponse() {
        return this.printResponse;
    };

    addSideEffect(sideEffect: () => Promise<any>) {
        this.sideEffects.push(sideEffect);
        return this;
    }

    setMiddlewares(...middlewares: ServerApi_Middleware[]) {
        this.middlewares = middlewares;
        return this;
    }

    addMiddlewares(...middlewares: ServerApi_Middleware[]) {
        this.middlewares = [...(this.middlewares || []), ...middlewares];
        return this;
    }

    addHeaderToLog(...headersToLog: string[]) {
        this.headersToLog.push(...headersToLog);
    }

    setBodyValidator(bodyValidator: ValidatorTypeResolver<B>) {
        this.bodyValidator = bodyValidator;
    }

    setQueryValidator(queryValidator: ValidatorTypeResolver<P>) {
        this.queryValidator = queryValidator;
    }

    asProxy(): ServerApi<Binder> {
        return new ServerApi_Proxy<Binder>(this);
    }

    getUrl() {
        return this.url;
    }

    dontPrintResponse() {
        this.printResponse = false;
    }

    setMaxResponsePrintSize(printResponseMaxSizeBytes: number) {
        this.printResponse = printResponseMaxSizeBytes > -1;
    }

    public route(router: ExpressRouter, prefixUrl: string, baseUrl: string) {
        this.baseUrl = baseUrl;
        const fullPath = `${prefixUrl ? prefixUrl : ""}/${this.relativePath}`;
        this.setTag(fullPath);
        router[this.method](fullPath, this.callWrapper);
        this.url = `${baseUrl}${fullPath}`;
    }

    assertProperty = assertProperty;

    callWrapper = async (req: ExpressRequest, res: ExpressResponse) => {
        await this.call(req, res)
        await this.releaseSideEffects();
    }

    private releaseSideEffects = async () => {
        try {
            await Promise.all(this.sideEffects.map(sideEffect => sideEffect()))
        } catch (e) {
            this.logError("Something went wrong while performing the side effects", e);
        } finally {
            this.sideEffects = [];
        }
    };

    call = async (req: ExpressRequest, res: ExpressResponse) => {
        const response: ApiResponse = new ApiResponse(this, res);

        this.logInfo(`Intercepted Url: ${req.path}`);

        if (this.headersToLog.length > 0) {
            const headers: { [s: string]: string | undefined } = {};
            for (const headerName of this.headersToLog) {
                headers[headerName] = req.header(headerName);
            }
            this.logDebug(`-- Headers: `, headers);
        }

        const reqQuery: P = parse(req.url, true).query as P;
        if (reqQuery && typeof reqQuery === "object" && Object.keys(reqQuery as QueryParams).length)
            this.logVerbose(`-- Url Params: `, reqQuery);
        else
            this.logVerbose(`-- No Params`);

        const body: B | string | undefined = req.body;
        if (body && ((typeof body === "object")))
            this.logVerbose(`-- Body (Object): `, body as unknown as object);
        else if (body && (body as string).length)
            this.logVerbose(`-- Body (String): `, body as unknown as string);
        else
            this.logVerbose(`-- No Body`);

        const requestData: HttpRequestData = {
            method: this.method,
            originalUrl: req.path,
            headers: req.headers,
            url: req.url,
            query: reqQuery,
            body: body as B
        };

        try {
            this.bodyValidator && validate<B>(body as B, this.bodyValidator);
            this.queryValidator && validate<P>(reqQuery, this.queryValidator);

            const context = await this.applyMiddlewares(req, requestData, response);

            const toReturn: unknown = await this.process(req, response, reqQuery, body as B, context);
            if (response.isConsumed())
                return;

            if (!toReturn)
                return await response.end(200);

            // TODO need to handle stream and buffers
            // if (Buffer.isBuffer(toReturn))
            // 	return response.stream(200, toReturn as Buffer);

            const responseType = typeof toReturn;
            if (responseType === "object")
                return await response.json(200, toReturn as object);

            if (responseType === "string" && (toReturn as string).toLowerCase().startsWith("<html"))
                return await response.html(200, toReturn as string);

            return await response.text(200, toReturn as string);
        } catch (err) {
            let e: any = err;
            let severity: ServerErrorSeverity = ServerErrorSeverity.Warning;
            if (typeof e === "string")
                e = new BadImplementationException(`String was thrown: ${e}`);

            if (!(e instanceof Error) && typeof e === "object")
                e = new BadImplementationException(`Object instance was thrown: ${JSON.stringify(e)}`);

            try {
                this.logErrorBold(e);
            } catch (e2) {
                this.logErrorBold("Error while handling error on request...", e2);
                this.logErrorBold(`Original error thrown: ${JSON.stringify(e)}`);
                this.logErrorBold(`-- Someone was stupid... you MUST only throw an Error and not objects or strings!! --`);
            }

            if (isErrorOfType(e, ValidationException))
                e = new ApiException(400, "Validator exception", e);

            if (!isErrorOfType(e, ApiException))
                e = new ApiException(500, "Unexpected server error", e);

            const apiException = isErrorOfType(e, ApiException);
            if (!apiException)
                throw new MUSTNeverHappenException("MUST NEVER REACH HERE!!!");

            if (apiException.responseCode >= 500)
                severity = ServerErrorSeverity.Error;
            else if (apiException.responseCode >= 400)
                severity = ServerErrorSeverity.Warning;

            switch (apiException.responseCode) {
                case 401:
                    severity = ServerErrorSeverity.Debug;
                    break;

                case 404:
                    severity = ServerErrorSeverity.Info;
                    break;

                case 403:
                    severity = ServerErrorSeverity.Warning;
                    break;

                case 500:
                    severity = ServerErrorSeverity.Critical;
                    break;
            }

            try {
                const httpServer = Storm.getInstance()?.getHttpServer();
                if (httpServer) {
                    const message = await httpServer.errorMessageComposer(requestData, apiException);
                    await dispatch_onServerError.dispatchModuleAsync([
                        severity,
                        httpServer,
                        message
                    ]);
                }
            } catch (e) {
                this.logError("Error while handing server error", e);
            }
            if (apiException.responseCode === 500)
                return response.serverError(apiException);

            return response.exception(apiException);
        }
    };

    private async applyMiddlewares(req: ExpressRequest, requestData: HttpRequestData, response: ApiResponse): Promise<ObjectTS> {
        if (!this.middlewares)
            return {};

        const contextList = await Promise.all(this.middlewares.map(async m => m(req, requestData, response)));

        return contextList.reduce((acc: ObjectTS, c) => merge(acc, c || {}), {})
    }

    protected abstract process(request: ExpressRequest, response: ApiResponse, queryParams: P, body: B, context: ObjectTS): Promise<R>;

}

export abstract class ServerApi_Get<Binder extends ApiWithQuery<U, R, P>, U extends string = DeriveUrlType<Binder>, R = DeriveResponseType<Binder>, P extends QueryParams | {} = DeriveQueryType<Binder>>
    extends ServerApi<Binder> {

    protected constructor(apiName: string) {
        super(HttpMethod.GET, apiName);
    }
}

export abstract class ServerApi_Post<Binder extends ApiWithBody<U, R, B>, U extends string = DeriveUrlType<Binder>, R = DeriveResponseType<Binder>, B = DeriveBodyType<Binder>>
    extends ServerApi<Binder> {

    protected constructor(apiName: string) {
        super(HttpMethod.POST, apiName);
    }
}

export class ServerApi_Proxy<Binder extends ApiTypeBinder<string, R, B, P>, R = DeriveResponseType<Binder>, B = DeriveBodyType<Binder>, P extends QueryParams | {} = DeriveQueryType<Binder>>
    extends ServerApi<Binder> {
    private readonly api: ServerApi<Binder>;

    public constructor(api: ServerApi<any>) {
        super(api.method, `${api.relativePath}/proxy`);
        this.api = api;
        this.setMiddlewares(RemoteProxy.Middleware);
    }

    protected async process(request: ExpressRequest, response: ApiResponse, queryParams: DeriveQueryType<Binder>, body: DeriveBodyType<Binder>, context: ObjectTS): Promise<DeriveResponseType<Binder>> {
        // @ts-ignore
        return this.api.process(request, response, queryParams, body, context);
    }
}

export class ServerApi_Redirect
    extends ServerApi<any> {
    private readonly responseCode: number;
    private readonly redirectUrl: string;

    public constructor(apiName: string, responseCode: number, redirectUrl: string) {
        super(HttpMethod.ALL, apiName);
        this.responseCode = responseCode;
        this.redirectUrl = redirectUrl;
    }

    protected async process(request: ExpressRequest, response: ApiResponse, queryParams: QueryParams, body: any): Promise<void> {
        const query = queryParams ? _keys<QueryParams, string>(queryParams).reduce((c: string, k: string) => c + '&' + k + '=' + queryParams[k], '?') : '';
        response.redirect(this.responseCode, `${this.baseUrl}${this.redirectUrl}${query}`);
    }
}

export class ApiResponse {
    private api: ServerApi<any>;
    private readonly res: ExpressResponse;
    private consumed: boolean = false;

    constructor(api: ServerApi<any>, res: ExpressResponse) {
        this.api = api;
        this.res = res;
    }

    public isConsumed(): boolean {
        return this.consumed;
    }

    private consume() {
        if (this.consumed) {
            this.api.logError("This API was already satisfied!!", new Error());
            return;
        }

        this.consumed = true;
    }

    stream(responseCode: number, stream: Stream, headers?: any) {
        this.consume();

        this.printHeaders(headers);
        this.res.set(headers);
        this.res.writeHead(responseCode);
        stream.pipe(this.res, {end: false});
        stream.on('end', () => {
            this.res.end();
        });
    }

    private printHeaders(headers?: any) {
        if (!headers)
            return this.api.logVerbose(` -- No response headers`);

        this.api.logVerbose(` -- Response with headers: `, headers);
    }

    private printResponse(response?: string | object) {
        if (!response)
            return this.api.logVerbose(` -- No response body`);

        if (!this.api.shouldPrintResponse())
            return this.api.logVerbose(` -- Response: -- Not Printing --`);

        this.api.logVerbose(` -- Response:`, response);
    }

    public code(responseCode: number, headers?: any) {
        this.printHeaders(headers);
        this.end(responseCode, "", headers);
    }

    text(responseCode: number, response?: string, _headers?: any) {
        const headers = (_headers || {});
        headers["content-type"] = "text/plain";

        this.end(responseCode, response, headers);
    }

    html(responseCode: number, response?: string, _headers?: any) {
        const headers = (_headers || {});
        headers["content-type"] = "text/html";

        this.end(responseCode, response, headers);
    }

    json(responseCode: number, response?: object | string, _headers?: any) {
        this._json(responseCode, response, _headers);
    }


    private _json(responseCode: number, response?: object | string, _headers?: any) {
        const headers = (_headers || {});
        headers["content-type"] = "application/json";

        this.end(responseCode, response, headers);
    }

    end(responseCode: number, response?: object | string, headers?: any) {
        this.consume();

        this.printHeaders(headers);
        this.printResponse(response);

        this.res.set(headers);
        this.res.writeHead(responseCode);
        this.res.end(typeof response !== "string" ? JSON.stringify(response, null, 2) : response);
    }

    setHeaders(headers: any): void {
        this.res.header(headers);
    }

    setHeader(headerKey: string, value: string | string[]): void {
        this.res.header(headerKey, value);
    }

    redirect(responseCode: number, url: string) {
        this.consume();

        this.res.redirect(responseCode, url);
    }

    exception(exception: ApiException, headers?: any) {
        const responseBody = exception.responseBody;
        if (!ServerApi.isDebug)
            delete responseBody.debugMessage;

        this._json(exception.responseCode, responseBody, headers);
    }

    serverError(error: Error & { cause?: Error }, headers?: any) {
        const stack = error.cause ? error.cause.stack : error.stack;
        const message = (error.cause ? error.cause.message : error.message) || "";
        this.text(500, ServerApi.isDebug && stack ? stack : message, headers);
    }
}
