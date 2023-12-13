import {
	BadImplementationException,
	ImplementationMissingException,
	Module,
	StringMap,
	TypedMap
} from "@intuitionrobotics/ts-common";
import {
	ApiException,
	promisifyRequest
} from "@intuitionrobotics/thunderstorm/backend";
import {HttpMethod} from "@intuitionrobotics/thunderstorm";
import {
	JiraIssueText,
	JiraUtils
} from "./utils";
import {
	JiraVersion,
	JiraVersion_Create
} from "../../shared/version";
import {AxiosRequestConfig} from "axios";

type Config = {
	auth: JiraAuth
	defaultAssignee: JiraUser,
	baseUrl?: string
}

type JiraAuth = {
	email: string
	apiKey: string
};

type JiraUser = {
	accountId: string,
	name?: string,
	email?: string
}

type JiraMark = {
	type: string
	attrs: {
		href: string
	}
}

type JiraContent = {
	type: "paragraph" | string
	text?: string
	marks?: JiraMark[]
	content?: JiraContent[]
}

type JiraDescription = string | {
	type: "doc" | string
	version: number
	content: JiraContent[]
}

export type JiraIssue_Fields = {
	project: JiraProject
	// project: JiraProjectInfo
	issuetype: IssueType
	description: JiraDescription
	summary: string
	reporter?: { id: string }
} & TypedMap<any>

export type IssueType = {
	id?: string
	name: string
}

export type LabelType = {
	label: string[]
}

export type JiraProject = {
	id: string
	name: string
	key: string
}

export type BaseIssue = {
	id: string
	key: string
	self: string
	url: string
};

export type JiraIssue = BaseIssue & {
	expand: string
	fields: JiraIssue_Fields
};

export type FixVersionType = {
	fixVersions: { name: string }[]
};

export type QueryItemWithOperator = {
	value: string,
	operator: string
}

export type JiraQuery = TypedMap<string | string[] | QueryItemWithOperator> & {
	status?: string | string[]
	project?: string | string[]
	fixVersion?: string | string[]
};

export type JiraResponse_IssuesQuery = {
	expand: string,
	startAt: number,
	maxResults: number,
	total: number,
	issues: JiraIssue[]
}
export type ResponsePostIssue = BaseIssue;

const createFormData = (filename: string, buffer: Buffer) => ({file: {value: buffer, options: {filename}}});

export class JiraModule_Class
	extends Module<Config> {
	private projects!: JiraProject[];
	private versions: { [projectId: string]: JiraVersion[] } = {};

	constructor() {
		super("JiraModule");
	}
	private getHeadersJson() {
		if (!this.config.auth || !this.config.auth.apiKey || !this.config.auth.email)
			throw new ImplementationMissingException('Missing auth config variables for JiraModule');

		return this.buildHeaders(this.config.auth, true);
	}
	private getHeadersForm() {
		if (!this.config.auth || !this.config.auth.apiKey || !this.config.auth.email)
			throw new ImplementationMissingException('Missing auth config variables for JiraModule');

		return this.buildHeaders(this.config.auth, false);
	}

	private getRestUrl() {
		if (!this.config.baseUrl)
			throw new ImplementationMissingException("Missing Jira baseUrl for JiraModule, please add the key baseUrl to the config");

		return this.config.baseUrl + '/rest/api/3';
	}

	private buildHeaders = ({apiKey, email}: JiraAuth, check: boolean) => {
		const headers: StringMap = {
			Authorization: `Basic ${Buffer.from(email + ':' + apiKey).toString('base64')}`
		};

		if (!check) {
			headers['X-Atlassian-Token'] = 'no-check';
			headers['Content-Type'] = 'multipart/form-data';
		} else {
			headers.Accept = 'application/json';
			headers['Content-Type'] = 'application/json';
		}

		return headers;
	};

	project = {
		query: async (projectKey: string) => {
			if (!this.projects)
				this.projects = await this.executeGetRequest<JiraProject[]>(`/project`);

			const project = this.projects.find(_project => _project.key === projectKey);
			if (!project)
				throw new BadImplementationException(`Could not find project: ${projectKey}`);

			return project;
		}
	};

	version = {
		query: async (projectId: string, versionName: string) => {
			if (!this.versions[projectId])
				this.versions[projectId] = await this.executeGetRequest<JiraVersion[]>(`/project/${projectId}/versions`);

			return this.versions[projectId].find(version => version.name === versionName);
		},
		create: async (projectId: string, versionName: string) => {
			const version = await this.executePostRequest<JiraVersion, JiraVersion_Create>(`/version`, {projectId, name: versionName});
			this.versions[projectId].push(version);
			return version;
		}
	};

	comment = {
		add: async (issueKey: string, comment: string) => {
			return this.executePostRequest(`/issue/${issueKey}/comment`, JiraUtils.createText(comment));
		}
	};

	issue = {
		query: async (query: JiraQuery): Promise<JiraIssue[]> => {
			return (await this.executeGetRequest<JiraResponse_IssuesQuery>(`/search`, {jql: JiraUtils.buildJQL(query)})).issues;
		},
		get: async (issueId: string): Promise<JiraIssue> => {
			return this.executeGetRequest(`/issue/${issueId}`);
		},
		comment: this.comment,
		create: async (project: JiraProject, issueType: IssueType, summary: string, descriptions: JiraIssueText[], label?: string[]): Promise<ResponsePostIssue> => {
			const issue = await this.executePostRequest<ResponsePostIssue, Pick<JiraIssue, "fields">>('/issue', {
				fields: {
					project,
					issuetype: issueType,
					description: JiraUtils.createText(...descriptions),
					summary,
					labels: label || [],
					assignee: {
						accountId: this.config.defaultAssignee.accountId
					}
				}
			});
			issue.url = `${this.config.baseUrl}/browse/${issue.key}`;
			return issue;
		},
		update: async (issueKey: string, fields: Partial<JiraIssue_Fields>) => {
			return this.executePutRequest<{ fields: Partial<JiraIssue_Fields> }>(`/issue/${issueKey}`, {fields});
		},
		resolve: async (issueKey: string, projectKey: string, versionName: string, status: string) => {
			const project = await JiraModule.project.query(projectKey);
			let version = await JiraModule.version.query(projectKey, versionName);
			if (!version)
				version = await JiraModule.version.create(project.id, versionName);

			return this.executePutRequest<{ fields: Partial<JiraIssue_Fields> }>(`/issue/${issueKey}`, {fields: {fixVersions: [{id: version.id}]}});
		}
	};

	getIssueTypes = async (id: string) => {
		return this.executeGetRequest('/issue/createmetadata', {projectKeys: id});
	};


	query = async (query: JiraQuery): Promise<JiraIssue[]> => {
		return (await this.executeGetRequest<JiraResponse_IssuesQuery>(`/search`, {jql: JiraUtils.buildJQL(query)})).issues;
	};

	getIssueRequest = async (issueId: string): Promise<JiraIssue> => {
		return this.executeGetRequest(`/issue/${issueId}`);
	};

	addIssueAttachment = async (issue: string, file: Buffer) => {
		return this.executeFormRequest(`/issue/${issue}/attachments`, file);
	};

	private executeFormRequest = async (url: string, buffer: Buffer) => {
		const request: AxiosRequestConfig = {
			headers: this.getHeadersForm(),
			url: `${this.getRestUrl()}${url}`,
			data: createFormData('logs.zip', buffer),
			method: HttpMethod.POST
		};
		return this.executeRequest(request);
	};

	private async executePostRequest<Res, Req>(url: string, body: Req, label?: string[]) {
		const request: AxiosRequestConfig = {
			headers: this.getHeadersJson(),
			url: `${this.getRestUrl()}${url}`,
			data: body,
			method: HttpMethod.POST,
			responseType: 'json'
		};
		return this.executeRequest<Res>(request);
	}

	private async executePutRequest<T>(url: string, body: T) {
		const request: AxiosRequestConfig = {
			headers: this.getHeadersJson(),
			url: `${this.getRestUrl()}${url}`,
			data: body,
			method: HttpMethod.PUT,
			responseType: 'json'
		};
		return this.executeRequest(request);
	}

	private async executeGetRequest<T>(url: string, _params?: { [k: string]: string }) {
		const params = _params && Object.keys(_params).map((key) => {
			return `${key}=${_params[key]}`;
		});

		let urlParams = "";
		if (params && params.length > 0)
			urlParams = `?${params.join("&")}`;

		const request: AxiosRequestConfig = {
			headers: this.getHeadersJson(),
			url: `${this.getRestUrl()}${url}${urlParams}`,
			method: HttpMethod.GET,
			responseType: "json"
		};

		return this.executeRequest<T>(request);
	}

	private async executeRequest<T>(request: AxiosRequestConfig): Promise<T> {
		const response = await promisifyRequest(request);
		const statusCode = response.status;
		// TODO: need to handle 1XX and 3XX
		if (statusCode < 200 || statusCode >= 300)
			throw new ApiException(statusCode, response.data);

		return response.data as T
	}
}

export const JiraModule = new JiraModule_Class();

