import {App} from "./app/App";
import {Thunder} from "@intuitionrobotics/thunderstorm/app-frontend/core/Thunder";

new Thunder()
    .setConfig(require("./config").config)
    .setMainApp(App)
    .build();

