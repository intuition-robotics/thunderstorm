import {Module} from "@intuitionrobotics/ts-common/core/module";
import {ObjectTS} from "@intuitionrobotics/ts-common/utils/types";
import {ImplementationMissingException} from "@intuitionrobotics/ts-common/core/exceptions";

import {HeaderKey, ServerApi_Middleware} from "../server/HttpServer";
import {ApiException} from "../../exceptions";
import {HttpRequestData} from "../server/server-api";
import {ExpressRequest, QueryRequestInfo} from "../../utils/types";

type ProxyConfig = {
    extras?: ObjectTS
    urls: string[],
    secret: string
};
export type RemoteProxyConfig = {
    remotes: {
        [proxyId: string]: ProxyConfig
    }
    secretHeaderName?: string
    proxyHeaderName?: string
}

export class RemoteProxy_Class<Config extends RemoteProxyConfig>
    extends Module<Config>
    implements QueryRequestInfo {

    constructor() {
        super("RemoteProxy");
    }

    async __queryRequestInfo(request: ExpressRequest): Promise<{ key: string; data: any; }> {
        let data: string | undefined;
        try {
            data = this.getProxyHeader(request);
        } catch (e) {
        }
        return {
            key: this.getName(),
            data
        };
    }

    getProxyHeader(request: ExpressRequest) {
        return this.proxyHeader.get(request);
    }

    private getSecretHeader(request: ExpressRequest) {
        return this.secretHeader.get(request);
    }

    readonly Middleware: ServerApi_Middleware = async (request: ExpressRequest) => {
        const extras = this.assertSecret(request);
        return {extras, proxyId: this.getProxyHeader(request)}
    };

    private secretHeader!: HeaderKey;
    private proxyHeader!: HeaderKey;

    protected init(): void {
        if (!this.config)
            throw new ImplementationMissingException("MUST specify config for this module!!");

        if (!this.config.secretHeaderName)
            this.config.secretHeaderName = 'x-secret';

        if (!this.config.proxyHeaderName)
            this.config.proxyHeaderName = 'x-proxy';

        this.secretHeader = new HeaderKey(this.config.secretHeaderName);
        this.proxyHeader = new HeaderKey(this.config.proxyHeaderName);
    }

    assertSecret(request: ExpressRequest) {
        if (!this.secretHeader || !this.proxyHeader)
            throw new ImplementationMissingException("MUST add RemoteProxy to your module list!!!");

        const secret = this.getSecretHeader(request);
        const proxyId = this.getProxyHeader(request);

        const expectedSecret = this.config.remotes[proxyId];

        if (!proxyId)
            throw new ApiException(403, `Missing proxy declaration in config for ${proxyId} !!`);

        if (!secret)
            throw new ApiException(403, `Missing secret !!`);

        if (!expectedSecret)
            throw new ApiException(403, `ProxyId '${proxyId}' is not registered for remote access !!`);

        if (expectedSecret.secret !== secret)
            throw new ApiException(403, `Secret does not match for proxyId: ${proxyId}`);

        const requestUrl = request.path;
        if (!expectedSecret.urls || !expectedSecret.urls.includes(requestUrl))
            throw new ApiException(403, `Requested url '${requestUrl}' is not allowed from proxyId: ${proxyId}`);

        return expectedSecret.extras;
    }

    async processApi(request: ExpressRequest, requestData: HttpRequestData) {
        return this.assertSecret(request);
    }
}

export const RemoteProxy = new RemoteProxy_Class();
