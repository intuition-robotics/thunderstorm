import {App} from "./app/App";
import {Thunder} from "@intuitionrobotics/thunderstorm/app-frontend/core/Thunder";
import {XhrHttpModule} from "@intuitionrobotics/thunderstorm/app-frontend/modules/http/XhrHttpModule";

new Thunder()
    .setConfig(require("./config").config)
    .addModules(XhrHttpModule)
    .setMainApp(App)
    .build();

