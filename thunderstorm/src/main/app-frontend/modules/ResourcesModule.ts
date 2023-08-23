import { Module } from "@intuitionrobotics/ts-common/core/module";

export type ResourceId = string;

export class ResourcesModule_Class
	extends Module {

	private readonly relativePath: string;
	private readonly relativePathImages: string;

	constructor() {
		super("ResourcesModule");
		this.relativePath = "../../res/";
		this.relativePathImages = `${this.relativePath}images/`;
	}

	init() {
	}

	public getImageUrl(relativePath: ResourceId): string {
		return `${this.relativePathImages}${relativePath}`
	}
}

export const ResourcesModule = new ResourcesModule_Class();
