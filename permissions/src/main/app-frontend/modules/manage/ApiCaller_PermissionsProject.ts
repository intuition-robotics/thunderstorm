import {BaseDB_ApiGeneratorCaller} from "@intuitionrobotics/db-api-generator/app-frontend/BaseDB_ApiGeneratorCaller";
import {ThunderDispatcher} from "@intuitionrobotics/thunderstorm/app-frontend/core/thunder-dispatcher";
import {DB_PermissionProject} from "../../../shared/manager-types";

export interface OnPermissionsProjectsLoaded {
    __onPermissionsProjectsLoaded: () => void;
}


const dispatch_onPermissionsProjectsLoaded = new ThunderDispatcher<OnPermissionsProjectsLoaded, '__onPermissionsProjectsLoaded'>(
    '__onPermissionsProjectsLoaded');

export class PermissionsProjectModule_Class
    extends BaseDB_ApiGeneratorCaller<DB_PermissionProject> {
    private projects: DB_PermissionProject[] = [];
    private projectsCustomKeys: string[] = [];


    constructor() {
        super({key: "project", relativeUrl: "/v1/permissions/manage/project"}, "PermissionsProjectModule");
    }

    protected init(): void {
    }

    protected async onEntryCreated(response: DB_PermissionProject): Promise<void> {
        this.query();
    }

    protected async onEntryDeleted(response: DB_PermissionProject): Promise<void> {
        this.query();
    }

    protected async onEntryUpdated(response: DB_PermissionProject): Promise<void> {
        this.query();
    }

    protected async onGotUnique(response: DB_PermissionProject): Promise<void> {
    }

    protected async onQueryReturned(response: DB_PermissionProject[]): Promise<void> {
        this.projects = response;
        this.projectsCustomKeys = response.reduce((toRet, project) => {
            return toRet.concat(project.customKeys || []);
        }, [] as string[]);

        dispatch_onPermissionsProjectsLoaded.dispatchUI([]);
    }

    fetchProjects() {
        this.query();
        return this.projects;
    }

    getProjectsCustomKeys() {
        return this.projectsCustomKeys || [];
    }

    getProjects(): DB_PermissionProject[] {
        return this.projects || [];
    }

}

export const ApiCaller_PermissionsProject = new PermissionsProjectModule_Class();
