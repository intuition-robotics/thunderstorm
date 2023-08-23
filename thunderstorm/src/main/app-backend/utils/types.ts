import { Dispatcher } from "@intuitionrobotics/ts-common/core/dispatcher";
import * as express from "express";


export type Express = express.Express
export type ExpressRouter = express.Router
export type ExpressRequest = express.Request<any>
export type ExpressResponse = express.Response
export type ExpressRequestHandler = express.RequestHandler

export interface QueryRequestInfo {
	__queryRequestInfo(request: ExpressRequest): Promise<{ key: string, data: any }>
}

export const dispatch_queryRequestInfo = new Dispatcher<QueryRequestInfo, '__queryRequestInfo'>('__queryRequestInfo');
