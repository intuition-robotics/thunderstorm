import {
	ImplementationMissingException,
	Module,
	StringMap
} from "@nu-art/ts-common";
import {ThunderDispatcher} from "@nu-art/thunderstorm/app-frontend/core/thunder-dispatcher";
import {XhrHttpModule} from "@nu-art/thunderstorm/frontend";
import {HttpMethod} from "@nu-art/thunderstorm";
import {
	PermissionsApi_UserUrlsPermissions,
	UserUrlsPermissions
} from "../..";

export type PermissionsModuleFEConfig = {
	projectId: string
}

export interface OnPermissionsChanged {
	__onPermissionsChanged: () => void;
}

export interface OnPermissionsFailed {
	__onPermissionsFailed: () => void
}

const dispatch_onPermissionsChanged = new ThunderDispatcher<OnPermissionsChanged, "__onPermissionsChanged">("__onPermissionsChanged");
const dispatch_onPermissionsFailed = new ThunderDispatcher<OnPermissionsFailed, "__onPermissionsFailed">("__onPermissionsFailed");

export class PermissionsModuleFE_Class
	extends Module<PermissionsModuleFEConfig> {
	private loadingUrls = new Set<string>();
	private userUrlsPermissions: UserUrlsPermissions = {};
	private requestCustomField: StringMap = {};
	private debounceTime = 100;
	private retryCounter = 0;

	setDebounceTime(time: number) {
		this.debounceTime = time;
	}

	setCustomField(key: string, value: string) {
		this.requestCustomField[key] = value;
		this.setPermissions();
	}

	loadUrls(urls: string[]) {
		urls.forEach(url => {
			if (this.loadingUrls.has(url) || this.userUrlsPermissions[url] !== undefined)
				return;

			this.loadingUrls.add(url);
			this.userUrlsPermissions[url] = false;
		});

		this.setPermissions();
	}

	doesUserHavePermissions(url: string): boolean | undefined {
		if (this.loadingUrls.has(url))
			return undefined;

		const permitted = this.userUrlsPermissions[url];
		if (permitted !== undefined)
			return permitted;

		this.loadingUrls.add(url);
		this.userUrlsPermissions[url] = false;
		this.setPermissions();
		return undefined;
	}

	setPermissions() {
		if (!this.config || !this.config.projectId)
			throw new ImplementationMissingException("need to set up a project id config");

		this.debounce(() => {
			XhrHttpModule
				.createRequest<PermissionsApi_UserUrlsPermissions>(HttpMethod.POST, 'user-urls-permissions')
				.setRelativeUrl(`/v1/permissions/user-urls-permissions`)
				// .setOnError(`Failed to get user urls permissions`)
				.setLabel(`Getting user urls permissions`)
				.setJsonBody({
					             projectId: this.config.projectId,
					             urls: this.userUrlsPermissions,
					             requestCustomField: this.requestCustomField
				             })
				.setOnError(() => {
					this.logWarning(`Failed to get user urls permissions`);
					if (this.retryCounter < 5) {
						this.retryCounter++;
						return this.setPermissions();
					}
					dispatch_onPermissionsFailed.dispatchModule([]);
				})
				.execute(async (userUrlsPermissions: UserUrlsPermissions) => {
					Object.keys(userUrlsPermissions).forEach(url => {
						this.loadingUrls.delete(url);
						this.userUrlsPermissions[url] = userUrlsPermissions[url];
					});
					dispatch_onPermissionsChanged.dispatchUI([]);
				});
		}, 'get-permissions', this.debounceTime);
	}

}

export const PermissionsFE = new PermissionsModuleFE_Class();