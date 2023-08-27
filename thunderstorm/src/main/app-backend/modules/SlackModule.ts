import {OnApplicationError, ServerErrorSeverity, ServerErrorSeverity_Ordinal } from "@intuitionrobotics/ts-common/core/error-handling";
import { Module } from "@intuitionrobotics/ts-common/core/module";
import { currentTimeMillies, Minute } from "@intuitionrobotics/ts-common/utils/date-time-tools";
import {WebAPICallResult, WebClient, WebClientOptions} from "@slack/web-api";

interface ChatPostMessageResult
    extends WebAPICallResult {
    channel: string;
    ts: string;
    message: {
        text: string;
    }
}

type ConfigType = {
    token: string
    defaultChannel: string
    throttlingTime?: number
    slackConfig?: Partial<WebClientOptions>
};

type _SlackMessage = {
    text: string
    channel: string
}

export type SlackMessage = string | _SlackMessage

type MessageMap = {
    [text: string]: number
}

export class SlackModule_Class
    extends Module<ConfigType> {
    private web!: WebClient;
    private messageMap: MessageMap = {};

    constructor() {
        super("SlackModule");
    }

    protected init(): void {
        if (!this.config.token)
            return
        // throw new ImplementationMissingException('Missing config token for SlackModule. Please add it');

        this.web = new WebClient(
            this.config.token,
            {
                rejectRateLimitedCalls: true,
                ...this.config.slackConfig
            });
    }

    public async postMessage(slackMessage: SlackMessage) {
        const parameters: SlackMessage = typeof slackMessage === 'string' ? {
            text: slackMessage,
            channel: this.config.defaultChannel
        } : slackMessage;

        const time = this.messageMap[parameters.text];
        if (time && currentTimeMillies() - time < (this.config.throttlingTime || Minute))
            return;

        try {
            return await this.postMessageImpl(parameters);
        } catch (e) {
            this.logError(`Error while sending a message to channel: ${parameters.channel}`, e);
        }
    }

    private async postMessageImpl(message: _SlackMessage) {
        const res = await this.web.chat.postMessage(message) as ChatPostMessageResult;
        this.messageMap[message.text] = currentTimeMillies();

        this.logDebug(
            `A message was posted to channel: ${message.channel} with message id ${res.ts} which contains the message ${message.text}`);

    }
}

export const SlackModule = new SlackModule_Class();

type ApiErrorConfig = {
    exclude: string[]
    minLevel: ServerErrorSeverity
}

export class Slack_ServerApiError_Class
    extends Module<ApiErrorConfig>
    implements OnApplicationError {
    constructor() {
        super("Slack_ServerApiError");
        this.setConfig({exclude: [], minLevel: ServerErrorSeverity.Info})
    }

    protected init(): void {
    }

    async __processApplicationError(errorLevel: ServerErrorSeverity, module: Module, message: string) {
        if (ServerErrorSeverity_Ordinal.indexOf(errorLevel) < ServerErrorSeverity_Ordinal.indexOf(this.config.minLevel))
            return;

        for (const key of this.config.exclude || []) {
            if (message.includes(key))
                return
        }

        await SlackModule.postMessage(`\`\`\`${message}\`\`\``);
    }
}

export const Slack_ServerApiError = new Slack_ServerApiError_Class();
