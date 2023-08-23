import {BaseDB_ApiGeneratorCaller} from "@intuitionrobotics/db-api-generator/app-frontend/BaseDB_ApiGeneratorCaller";
import {ThunderDispatcher} from "@intuitionrobotics/thunderstorm/app-frontend/core/thunder-dispatcher";
import {DB_PermissionDomain} from "../../../shared/manager-types";

export interface OnPermissionsDomainsLoaded {
    __onPermissionsDomainsLoaded: () => void;
}

const dispatch_onPermissionsDomainsLoaded = new ThunderDispatcher<OnPermissionsDomainsLoaded, "__onPermissionsDomainsLoaded">("__onPermissionsDomainsLoaded");

export class PermissionsDomainModule_Class
    extends BaseDB_ApiGeneratorCaller<DB_PermissionDomain> {
    private domains: { [k: string]: DB_PermissionDomain[] } = {};

    constructor() {
        super({key: "domain", relativeUrl: "/v1/permissions/manage/domain"}, "PermissionsDomainModule");
    }

    protected init(): void {
    }

    protected async onEntryCreated(response: DB_PermissionDomain): Promise<void> {
        this.query();
    }

    protected async onEntryDeleted(response: DB_PermissionDomain): Promise<void> {
        this.query();
    }

    protected async onEntryUpdated(response: DB_PermissionDomain): Promise<void> {
        this.query();
    }

    protected async onGotUnique(response: DB_PermissionDomain): Promise<void> {
    }

    protected async onQueryReturned(response: DB_PermissionDomain[]): Promise<void> {
        this.domains = {};
        response.forEach(domain => {
            const domainArray = this.domains[domain.projectId] || [];
            domainArray.push(domain);
            this.domains[domain.projectId] = domainArray
        });

        dispatch_onPermissionsDomainsLoaded.dispatchUI([]);
    }

    getDomains(projectId: string): DB_PermissionDomain[] {
        return this.domains[projectId] || [];
    }

    getAllDomains(): DB_PermissionDomain[] {
        let allDomainsArray: DB_PermissionDomain[] = [];
        for (const key of Object.keys(this.domains)) {
            allDomainsArray = allDomainsArray.concat(this.domains[key]);
        }

        return allDomainsArray;
    }

}

export const ApiCaller_PermissionsDomain = new PermissionsDomainModule_Class();
