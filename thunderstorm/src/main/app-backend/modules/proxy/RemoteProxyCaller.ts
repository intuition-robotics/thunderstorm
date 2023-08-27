import {Module} from "@intuitionrobotics/ts-common/core/module";
import {ImplementationMissingException} from "@intuitionrobotics/ts-common/core/exceptions";
import {__stringify} from "@intuitionrobotics/ts-common/utils/tools";
import {
    ApiWithBody,
    ApiWithQuery,
    DeriveBodyType,
    DeriveQueryType,
    DeriveResponseType,
    DeriveUrlType,
    QueryParams
} from "../../../shared/types";
import {promisifyRequest} from "../../utils/promisify-request";
import {ApiException} from "../../exceptions";
import {AxiosRequestConfig, AxiosResponse} from "axios";

export type RemoteServerConfig = {
    secretHeaderName: string
    proxyHeaderName: string
    proxyId: string
    secret: string
    url: string
}

export abstract class RemoteProxyCaller<Config extends RemoteServerConfig>
    extends Module<Config> {

    // noinspection TypeScriptAbstractClassConstructorCanBeMadeProtected
    constructor(name: string) {
        super(name);
    }

    protected init(): void {
        if (!this.config)
            throw new ImplementationMissingException("MUST specify config for this module!!");

        if (!this.config.proxyId)
            throw new ImplementationMissingException("MUST specify the proxyId for the proxy caller!!");

        if (!this.config.url)
            throw new ImplementationMissingException("MUST specify the url for the remote server!!");

        if (!this.config.secret)
            throw new ImplementationMissingException("MUST specify the secret for the remote server!!");

        if (!this.config.secretHeaderName)
            this.config.secretHeaderName = 'x-secret';

        if (!this.config.proxyHeaderName)
            this.config.proxyHeaderName = 'x-proxy';
    }

    protected executeGetRequest = async <Binder extends ApiWithQuery<U, R, P>, U extends string = DeriveUrlType<Binder>, R = DeriveResponseType<Binder>, P extends QueryParams = DeriveQueryType<Binder>>(url: U, _params: P, _headers?: {
        [key: string]: string
    }): Promise<R> => {
        const resp = await this.executeGetRequestImpl(url, _params, _headers);
        return resp.data as R;
    };

    protected executeGetRequestImpl = async <Binder extends ApiWithQuery<U, R, P>, U extends string = DeriveUrlType<Binder>, R = DeriveResponseType<Binder>, P extends QueryParams = DeriveQueryType<Binder>>(url: U, _params: P, _headers?: {
        [key: string]: string
    }): Promise<AxiosResponse<R>> => {
        const params = _params && Object.keys(_params).map((key) => {
            return `${key}=${_params[key]}`;
        });

        let urlParams = "";
        if (params && params.length > 0)
            urlParams = `?${params.join("&")}`;

        const proxyRequest: AxiosRequestConfig = {
            headers: {
                ..._headers,
                [this.config.secretHeaderName]: this.config.secret,
                [this.config.proxyHeaderName]: this.config.proxyId
            },
            url: `${this.config.url}${url}${urlParams}`,
            method: 'GET',
            responseType: 'json'
        };

        return this.executeRequest<R>(proxyRequest);
    };

    protected executePostRequest = async <Binder extends ApiWithBody<U, R, B>, U extends string = DeriveUrlType<Binder>, R = DeriveResponseType<Binder>, B = DeriveBodyType<Binder>>(url: U, body: B, _headers?: {
        [key: string]: string
    }): Promise<R> => {
        const resp = await this.executePostRequestImpl(url, body, _headers);
        return resp.data as R;
    };

    protected executePostRequestImpl = async <Binder extends ApiWithBody<U, R, B>, U extends string = DeriveUrlType<Binder>, R = DeriveResponseType<Binder>, B = DeriveBodyType<Binder>>(url: U, body: B, _headers?: {
        [key: string]: string
    }): Promise<AxiosResponse<R>> => {
        const proxyRequest: AxiosRequestConfig = {
            headers: {
                ..._headers,
                'Content-Type': 'application/json',
                [this.config.secretHeaderName]: this.config.secret,
                [this.config.proxyHeaderName]: this.config.proxyId
            },
            responseType: "json",
            url: `${this.config.url}${url}`,
            data: body,
            method: 'POST'
        };

        return this.executeRequest<R>(proxyRequest);
    }

    private executeRequest = async <ResponseType>(proxyRequest: AxiosRequestConfig): Promise<AxiosResponse<ResponseType>> => {
        const response = await promisifyRequest(proxyRequest);
        if (proxyRequest.headers) {
            delete proxyRequest.headers[this.config.secretHeaderName];
            delete proxyRequest.headers["Authorization"];
        }

        const statusCode = response.status;
        // TODO: need to handle 1XX and 3XX
        if (statusCode < 200 || statusCode >= 300) {
            const errorResponse = response.data;
            if (!errorResponse)
                throw new ApiException(500, `Extraneous error ${__stringify(response)}, Proxy Request: ${__stringify(proxyRequest, true)}`)

            const debugMessage = typeof errorResponse === 'object' ? errorResponse['debugMessage'] : errorResponse;
            const e = new ApiException<any>(
                response.status,
                `Redirect proxy error: ${debugMessage} \n Proxy Request: ${__stringify(proxyRequest, true)}`);
            if (errorResponse.error)
                e.setErrorBody(errorResponse.error);

            throw e;
        }

        return response;
    };
}
