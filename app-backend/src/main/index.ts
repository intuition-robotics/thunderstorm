// tslint:disable-next-line:no-import-side-effect
import 'module-alias/register';
import * as functions from "firebase-functions";
import {ForceUpgrade, RouteResolver, ServerApi, ServerApi_Get, Storm} from "@intuitionrobotics/thunderstorm/backend";
import {Environment} from "./config";
import {DispatchModule, ExampleModule} from "@modules/ExampleModule";
import {__stringify, _setTimeout, currentTimeMillies, merge, Minute, Module} from "@intuitionrobotics/ts-common";
import {PushPubSubModule} from '@intuitionrobotics/push-pub-sub/backend';
import {ValueChangedListener} from "@modules/ValueChangedListener";
import {SlackModule, Slack_ServerApiError} from "@intuitionrobotics/thunderstorm/app-backend/modules/SlackModule";
import {PostProcessor, ServerUploaderModule, UploaderModule} from "@intuitionrobotics/file-upload/backend";
import {FileWrapper, FirebaseModule} from '@intuitionrobotics/firebase/backend';
import {DB_Temp_File} from '@intuitionrobotics/file-upload/shared/types';
import {Firebase_ExpressFunction} from '@intuitionrobotics/firebase/backend-functions';
import {CollectionChangedListener} from "@modules/CollectionChangedListener"
import {PubsubExample} from "@modules/PubsubExample";
import defaultConfig from "./defaultConfig.json"

const vernpm_package_versionsion = process.env.npm_package_version as string;
console.log(`Starting server v${vernpm_package_versionsion} with env: ${Environment.name}`);

const modules: Module[] = [
    ValueChangedListener,
    CollectionChangedListener,
    ExampleModule,
    ForceUpgrade,
    SlackModule,
    Slack_ServerApiError,
    DispatchModule,
    PushPubSubModule,
    PubsubExample
];

const postProcessor: { [k: string]: PostProcessor } = {
    default: async (file: FileWrapper, doc: DB_Temp_File) => {
        await FirebaseModule.createAdminSession().getDatabase().set(`/alan/testing/${file.path}`, {
            path: file.path,
            name: await file.exists()
        });

        const resp = ServerUploaderModule.upload([{
            file: await file.read(),
            name: 'myTest.txt',
            mimeType: doc.mimeType
        }]);

        await new Promise<void>(res => {
            _setTimeout(() => {
                console.log(ServerUploaderModule.getFullFileInfo(resp[0].feId));
                res();
            }, 0.5 * Minute);
        });

        console.log(file);
    }
};
UploaderModule.setPostProcessor(postProcessor);
// BucketListener.setDefaultConfig({memory: "1GB", timeoutSeconds: 540})
Firebase_ExpressFunction.setConfig({memory: "1GB", timeoutSeconds: 540});

export class ServerApi_Health
    extends ServerApi_Get<any> {

    constructor(private readonly version: string, private readonly env: string, pathPart: string = '/health') {
        super(`${pathPart}/check`);
    }

    protected async process() {
        return {
            timestamp: currentTimeMillies(),
            version: this.version,
            env: this.env
        }
    }
}

const serverApiHealth: ServerApi<any> = new ServerApi_Health(vernpm_package_versionsion, Environment.name);
const _exports = new Storm()
    .addModules(...modules)
    .setInitialRouteResolver(new RouteResolver(require, __dirname, "api"))
    .setInitialRoutePath("/api")
    .setEnvironment(Environment.name)
    .registerApis(serverApiHealth, serverApiHealth)
    .setConfig(merge(defaultConfig, Environment.override || {}))
    .build();

_exports.logTest = functions.database.ref('triggerLogs').onWrite((change, context) => {
    console.log('LOG_TEST FUNCTION! -- Logging string');
    console.log(`Changed from: ${change.before} to --> ${change.after} with context: ${__stringify(context)}`);
    console.log({
        firstProps: 'String prop',
        secondProps: {
            a: 'Nested Object Prop',
            b: 10000
        }
    });
});

module.exports = _exports;
