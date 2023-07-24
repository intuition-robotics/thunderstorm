/*
 * Thunderstorm is a full web app framework!
 *
 * Typescript & Express backend infrastructure that natively runs on firebase function
 * Typescript & React frontend infrastructure
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

/**
 * Module dependencies.
 */

import * as compression from 'compression';
import * as fs from "fs";
import {addAllItemToArray, addItemToArray, LogLevel, Module, ObjectTS} from "@intuitionrobotics/ts-common";
import {ApiResponse, HttpRequestData, ServerApi} from "./server-api";
import {ApiException} from "../../exceptions";
import * as express from "express";

import {Express, ExpressRequest, ExpressRequestHandler, ExpressResponse} from "../../utils/types";
import {DefaultApiErrorMessageComposer} from "./server-errors";
import {HeaderKey_FunctionExecutionId, HeaderKey_JWT} from '../_imports';

const ALL_Methods: string[] = [
    'GET',
    'PUT',
    'PATCH',
    'POST',
    'DELETE',
    'OPTIONS'
];

const DefaultHeaders: string[] = [
    'content-type',
    'content-encoding',
    'x-session-id',
    'authorization'
]

const ExposedHeaders: string[] = [
    HeaderKey_FunctionExecutionId,
    HeaderKey_JWT
];

type ConfigType = {
    port: number;
    baseUrl: string;
    cors: {
        origins?: string[],
        methods?: string[],
        headers: string[],
        exposedHeaders?: string[]
    }
    ssl: { key: string, cert: string }
    bodyParserLimit: number | string
};

export type HttpErrorHandler = (requestData: HttpRequestData, error: ApiException) => Promise<string>;

export type ServerApi_Middleware = (request: ExpressRequest, data: HttpRequestData, response: ApiResponse) => Promise<ObjectTS | void>
type HttpRoute = {
    methods: string[]
    path: string
}

export class HttpServer_Class
    extends Module<ConfigType> {

    private static readonly expressMiddleware: ExpressRequestHandler[] = [];
    errorMessageComposer: HttpErrorHandler = DefaultApiErrorMessageComposer();
    readonly express: Express;
    private routes!: HttpRoute[];

    constructor(_express: Express) {
        super("http-server");
        this.express = _express;
    }

    setErrorMessageComposer(errorMessageComposer: HttpErrorHandler) {
        this.errorMessageComposer = errorMessageComposer;
    }

    static addMiddleware(middleware: ExpressRequestHandler) {
        HttpServer_Class.expressMiddleware.push(middleware);
        return this;
    }

    getRoutes() {
        return this.routes;
    }

    getBaseUrl() {
        return this.config.baseUrl;
    }

    protected async init() {
        this.setMinLevel(ServerApi.isDebug ? LogLevel.Verbose : LogLevel.Info)
        const baseUrl = this.config.baseUrl;
        if (baseUrl) {
            if (baseUrl.endsWith("/"))
                this.config.baseUrl = baseUrl.substring(0, baseUrl.length - 1);

            this.config.baseUrl = baseUrl.replace(/\/\//g, "/");
        }

        this.express.use((req, res, next) => {
            if (req)
                req.url = req.url.replace(/\/\//g, "/");

            next();
        });

        const parserLimit = this.config.bodyParserLimit;
        if (parserLimit)
            this.express.use(express.json({limit: parserLimit}));
        this.express.use(compression());
        for (const middleware of HttpServer_Class.expressMiddleware) {
            this.express.use(middleware);
        }

        const cors = this.config.cors || {};
        if (!cors.exposedHeaders)
            cors.exposedHeaders = ExposedHeaders;

        cors.headers = DefaultHeaders.reduce((toRet, item: string) => {
            if (!toRet.includes(item))
                addItemToArray(toRet, item);

            return toRet;
        }, cors.headers || []);

        const resolveCorsOrigin = (origin?: string | string[]): string | undefined => {
            let _origin: string;
            if (!origin)
                return;

            if (typeof origin === "string")
                _origin = origin;
            else
                _origin = origin[0];

            if (!cors.origins)
                return _origin;

            if (cors.origins.indexOf(_origin.toLowerCase()) > -1)
                return _origin;
        };

        this.express.all("*", (req: ExpressRequest, res: ExpressResponse, next: express.NextFunction) => {
            let origin = req.headers.origin;
            if (origin) {
                origin = resolveCorsOrigin(origin);
                if (!origin)
                    this.logWarning(`CORS issue!!!\n Origin: '${req.headers.origin}' does not exists in config: ${JSON.stringify(cors.origins)}`);
            }

            res.header('Access-Control-Allow-Origin', origin || "N/A");
            res.header('Access-Control-Allow-Methods', (cors.methods || ALL_Methods).join(","));
            res.header('Access-Control-Allow-Headers', cors.headers.join(","));
            res.header('Access-Control-Expose-Headers', cors.exposedHeaders?.join(","));

            next();
        });
        this.express.options("*", (req: ExpressRequest, res: ExpressResponse) => {
            res.end();
        });
    }

    public printRoutes(prefix: string): void {
        if (!ServerApi.isDebug)
            return;

        const label = `Printing ${this.routes.length} Routes`;
        console.time(label)
        this.routes.forEach(route => this.logInfo(`${JSON.stringify(route.methods)} ${prefix}${route.path}`));
        console.timeEnd(label)
    }

    public resolveApi(routeResolver: RouteResolver, urlPrefix: string, apis: ServerApi<any>[]) {
        console.time('Resolving Apis')

        const baseUrl = this.getBaseUrl();
        // Load from those passed by init
        routeResolver.routeApis(apis, urlPrefix, baseUrl, this.express)

        // Load from folder structure recursively
        routeResolver.resolveApi(urlPrefix, baseUrl, this.express);

        const resolveRoutes = (stack: any[]): any[] => {
            return stack.map((layer: any) => {
                if (layer.route && typeof layer.route.path === "string") {
                    let methods = Object.keys(layer.route.methods);
                    if (methods.length > 20)
                        methods = ["ALL"];

                    return {methods: methods, path: layer.route.path};
                }

                if (layer.name === 'router')
                    return resolveRoutes(layer.handle.stack);

            }).filter(route => route);
        };

        const routes: (HttpRoute | HttpRoute[])[] = resolveRoutes(this.express._router.stack);
        this.routes = routes.reduce((toRet: HttpRoute[], route) => {
            const toAdd: HttpRoute[] = Array.isArray(route) ? route : [route];
            addAllItemToArray(toRet, toAdd);
            return toRet;
        }, []);
        console.timeEnd('Resolving Apis')
    }
}

export class RouteResolver {
    readonly require: NodeRequire;
    readonly rootDir: string;
    readonly apiFolder: string;
    private middlewares: ServerApi_Middleware[] = [];

    constructor(require: NodeRequire, rootDir: string, apiFolder?: string) {
        this.require = require;
        this.rootDir = rootDir;
        this.apiFolder = apiFolder || "";
    }

    setMiddlewares(...middlewares: ServerApi_Middleware[]) {
        this.middlewares = middlewares;
        return this;
    }

    public resolveApi(urlPrefix: string, baseUrl: string, _exp: Express) {
        this.resolveApiImpl(urlPrefix, this.rootDir + "/" + this.apiFolder, baseUrl, _exp)
    }

    private resolveApiImpl(urlPrefix: string, workingDir: string, baseUrl: string, _exp: Express) {
        fs.readdirSync(workingDir).forEach((file: string) => {
            if (fs.statSync(`${workingDir}/${file}`).isDirectory()) {
                this.resolveApiImpl(`${urlPrefix}/${file}`, `${workingDir}/${file}`, baseUrl, _exp);
                return;
            }

            if (file.endsWith(".d.ts"))
                return;

            if (!file.endsWith(".js"))
                return;

            if (file.startsWith("_"))
                return;

            const relativePathToFile = `.${workingDir.replace(this.rootDir, "")}/${file}`;
            if (file.startsWith("&")) {
                let routeResolver: RouteResolver;
                try {
                    routeResolver = this.require(relativePathToFile);
                } catch (e) {
                    console.log(`could not reference RouteResolver for: ${workingDir}/${relativePathToFile}`, e);
                    throw e;
                }

                routeResolver.resolveApi(urlPrefix, baseUrl, _exp);
                return;
            }

            let content: ServerApi<any, any, any> | ServerApi<any, any, any>[];
            try {
                content = this.require(relativePathToFile);
            } catch (e) {
                console.log(`could not reference ServerApi for: ${workingDir}/${relativePathToFile}`, e);
                throw e;
            }

            if (!Array.isArray(content))
                content = [content];

            this.routeApis(content, urlPrefix, baseUrl, _exp)
        });
    }

    public routeApis(apis: ServerApi<any>[], urlPrefix: string, baseUrl: string,_exp: Express) {
        apis.forEach(api => {
            api.addMiddlewares(...this.middlewares);
            api.route(_exp, urlPrefix, baseUrl);
        });
    }
}

export class HeaderKey {
    private readonly key: string;
    private readonly responseCode: number;

    constructor(key: string, responseCode: number = 400) {
        this.key = key;
        this.responseCode = responseCode;
    }

    get(request: ExpressRequest) {
        const value = request.header(this.key);
        if (!value)
            throw new ApiException(this.responseCode, `Missing expected header: ${this.key}`);

        return value;
    }
}
