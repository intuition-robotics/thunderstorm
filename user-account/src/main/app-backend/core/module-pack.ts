
import {AccountModule} from "../modules/AccountModule";
import {SecretsModule} from "../modules/SecretsModule";

export const Backend_ModulePack_Users = [
    AccountModule,
    SecretsModule
];

export * from "../modules/AccountModule";
export * from "../modules/SamlModule";

