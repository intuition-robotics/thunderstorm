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

import {FirebaseModule} from "@intuitionrobotics/firebase/backend";
import {BeLogged, LogClient_Function, LogClient_Terminal, Module} from "@intuitionrobotics/ts-common";
import {Firebase_ExpressFunction, FirebaseFunction} from '@intuitionrobotics/firebase/backend-functions';
import {HttpServer_Class, RouteResolver} from "../modules/server/HttpServer";
import {ServerApi} from "../modules/server/server-api";
import {BaseStorm} from "./BaseStorm";
import {Express} from "express";
import * as express from "express";

export class Storm
    extends BaseStorm {
    private routeResolver!: RouteResolver;
    private initialPath!: string;
    private functions: any[] = [];
    private apis: ServerApi<any>[] = [];
    private readonly express: Express;
    private readonly httpServer: HttpServer_Class;

    constructor(_express?: Express) {
        super();
        this.express = _express || express();
        this.httpServer = new HttpServer_Class(this.express);
        this.addModules(this.httpServer, FirebaseModule);
    }

    static getInstance(): Storm {
        return Storm.instance as Storm
    }

    getHttpServer(){
        return this.httpServer;
    }

    init() {
        BeLogged.addClient(process.env.GCLOUD_PROJECT && process.env.FUNCTIONS_EMULATOR ? LogClient_Terminal : LogClient_Function);
        ServerApi.isDebug = !!this.config?.isDebug;

        super.init();

        const urlPrefix = !process.env.GCLOUD_PROJECT ? this.initialPath : "";

        this.httpServer.resolveApi(this.routeResolver, urlPrefix, this.apis);

        this.httpServer.printRoutes(process.env.GCLOUD_PROJECT ? this.initialPath : "");
        return this;
    }

    registerApis(...apis: ServerApi<any>[]) {
        this.apis = apis;
        return this;
    }

    setInitialRouteResolver(routeResolver: RouteResolver) {
        this.routeResolver = routeResolver;
        return this;
    }

    setInitialRoutePath(initialPath: string) {
        this.initialPath = initialPath;
        return this;
    }

    startServer(onStarted?: () => Promise<void>) {
        const modulesAsFunction: FirebaseFunction[] = this.modules.filter((module: Module): module is FirebaseFunction => module instanceof FirebaseFunction);

        this.functions = [new Firebase_ExpressFunction(this.httpServer.express),
            ...modulesAsFunction];

        this.init();
        onStarted && onStarted().catch(e => this.logError(e));
        console.log("Server Started!!")

        return this.functions.reduce((toRet, _function) => {
            toRet[_function.getName()] = _function.getFunction();
            return toRet;
        }, {});
    }

    build(onStarted?: () => Promise<void>) {
        return this.startServer(onStarted);
    }
}
