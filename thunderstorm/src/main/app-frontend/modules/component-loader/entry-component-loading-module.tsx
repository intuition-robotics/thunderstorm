import {XhrHttpModule} from "../http/XhrHttpModule";
import {BrowserHistoryModule} from "../HistoryModule";
import {ApiWithQuery, HttpMethod} from "../../../shared/types";
import {Module} from "@intuitionrobotics/ts-common/core/module";
import {TS_Progress} from "../../../shared/request-types";

type ScriptLoaderBinder = ApiWithQuery<string, string>

export class PageLoadingModule_Class
    extends Module<{}> {

    constructor() {
        super("PageLoadingModule");
    }

    private readonly injected: { [src: string]: HTMLScriptElement } = {};

    loadScript(src: string, progressListener: (progress: number) => void) {
        XhrHttpModule
            .createRequest<ScriptLoaderBinder>(HttpMethod.GET, src)
            .setUrl(`${BrowserHistoryModule.getOrigin()}/${src}`)
            .setOnProgressListener((ev: TS_Progress) => {
                const progress = ev.loaded / ev.total;
                progressListener(progress);
            })
            .execute(response => {
                const divElement: HTMLScriptElement = document.createElement("script");
                divElement.innerHTML = response;
                divElement.id = src;
                divElement.async = true;
                this.injected[src] = divElement;
            });
    }

    getNode(src: string) {
        return this.injected[src];
    }
}

export const EntryComponentLoadingModule = new PageLoadingModule_Class();
