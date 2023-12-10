import {
	_keys,
	Module,
} from "@intuitionrobotics/ts-common";
import {
	createBrowserHistory,
	History,
	LocationDescriptorObject
} from "history";
import {QueryParams} from "../../index";

export class BrowserHistoryModule_Class
	extends Module {
	private readonly history: History<any>;

	constructor() {
		super("BrowserHistoryModule");
		this.history = createBrowserHistory();
	}

	push(push: LocationDescriptorObject) {
		this.history.push(push);
	}

	replace(push: LocationDescriptorObject) {
		this.history.replace(push);
	}

	private composeQuery(queryParams: QueryParams) {
		const queryAsString = _keys(queryParams).map((key) => `${key}=${queryParams[key]}`).join("&");
		if (queryAsString.length === 0)
			return undefined;

		return queryAsString;
	}

	private getEncodedQueryParams = (): QueryParams => {
		const queryParams: QueryParams = {};
		let queryAsString = window.location.search;
		if (!queryAsString || queryAsString.length === 0)
			return {};

		while (true) {
			if (queryAsString.startsWith("?"))
				queryAsString = queryAsString.substring(1);
			else if (queryAsString.startsWith("/?"))
				queryAsString = queryAsString.substring(1);
			else
				break;
		}

		const query = queryAsString.split("&");
		return query.map(param => {
			const parts = param.split("=");
			return {key: parts[0], value: parts[1]};
		}).reduce((toRet, param) => {
			if (param.key && param.value)
				toRet[param.key] = param.value;

			return toRet;
		}, queryParams);
	};

	getQueryParams() {
		const params = this.getEncodedQueryParams();
		_keys(params).forEach(key => {
			const value = params[key];
			if (!value) {
				delete params[key];
				return;
			}

			params[key] = decodeURIComponent(value);
		});
		return params;
	}

	setQuery(queryParams: QueryParams) {
		const encodedQueryParams = {...queryParams};
		_keys(encodedQueryParams).forEach(key => {
			const value = encodedQueryParams[key];
			if (!value) {
				delete encodedQueryParams[key];
				return;
			}

			encodedQueryParams[key] = encodeURIComponent(value);
		});

		this.updateQueryParams(encodedQueryParams);
	}

	addQueryParam(key: string, value: string) {
		const encodedQueryParams = this.getEncodedQueryParams();
		encodedQueryParams[key] = encodeURIComponent(value);

		this.updateQueryParams(encodedQueryParams);
	}

	removeQueryParam(key: string) {
		const encodedQueryParams = this.getEncodedQueryParams();
		delete encodedQueryParams[key];

		const data = this.createHistoryDataFromQueryParams(encodedQueryParams);

		this.replace(data);
	}

	setUrl(url: string, queryParams?: QueryParams) {
		this.push(this.createHistoryDataFromQueryParams(queryParams, url));
	}

	private createHistoryDataFromQueryParams(encodedQueryParams?: QueryParams, pathname: string = window.location.pathname) {
		return {
			pathname: !pathname.endsWith("/") ? pathname : pathname.substring(0, pathname.length - 1),
			search: !encodedQueryParams ? "" : this.composeQuery(encodedQueryParams)
		};
	}

	private updateQueryParams(encodedQueryParams: QueryParams) {
		const data = this.createHistoryDataFromQueryParams(encodedQueryParams);

		this.push(data);
	}

	getOrigin() {
		return window.location.origin;
	}

	getCurrent() {
		return this.history.location;
	}

	getHistory() {
		return this.history;
	}
}

export const BrowserHistoryModule = new BrowserHistoryModule_Class();
