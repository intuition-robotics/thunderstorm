// tslint:disable:no-import-side-effect
import './res/styles/styles.scss';

import {App} from "./app/App";
import {
	ForceUpgrade,
	Thunder
} from "@intuitionrobotics/thunderstorm/frontend";

import {Frontend_ModulePack_PushPubSub} from "@intuitionrobotics/push-pub-sub/frontend";
import {BugReportModule} from "@intuitionrobotics/bug-report/frontend";
import {Module} from '@intuitionrobotics/ts-common';
import {Frontend_ModulePack_Uploader} from "@intuitionrobotics/file-upload/frontend";
import {PermissionsFE} from '@intuitionrobotics/permissions/frontend';

const modules: Module[] = [
	ForceUpgrade,
	BugReportModule
];
PermissionsFE.setDefaultConfig({projectId: 'thunderstorm-staging'});

new Thunder()
	.setConfig(require("./config").config)
	.addModules(...Frontend_ModulePack_PushPubSub)
	.addModules(...Frontend_ModulePack_Uploader)
	.addModules(...modules)
	.setMainApp(App)
	.build();

