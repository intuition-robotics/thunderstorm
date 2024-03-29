import {
	BaseDB_ApiGenerator,
	ServerApi_Create,
	ServerApi_Delete,
	ServerApi_Query,
	ServerApi_Unique,
	validateStringAndNumbersWithDashes
} from "@intuitionrobotics/db-api-generator/backend";
import {
	Clause_Where,
	FirestoreQuery
} from "@intuitionrobotics/firebase";
import {
	ExpressRequest,
	ServerApi
} from "@intuitionrobotics/thunderstorm/backend";
import {
	TypeValidator,
	validateRegexp,
} from "@intuitionrobotics/ts-common";
import {DB_GroupTags} from "../..";
import {GroupPermissionsDB} from "./db-types/assign";

const validateGroupLabel = validateRegexp(/^[A-Za-z-\._ ]+$/);

export const CollectionNameTags = 'permissions--tags';


export class TagsDB_Class
	extends BaseDB_ApiGenerator<DB_GroupTags> {

	static _validator: TypeValidator<DB_GroupTags> = {
		_id: validateStringAndNumbersWithDashes,
		label: validateGroupLabel
	};

	constructor() {
		super(CollectionNameTags, TagsDB_Class._validator, "permissionsTags", "TagsDB");
	}


	protected internalFilter(item: DB_GroupTags): Clause_Where<DB_GroupTags>[] {
		const {label} = item;
		return [{label}];
	}

	async delete(query: FirestoreQuery<DB_GroupTags>, request?: ExpressRequest) {
		query.where?._id && await GroupPermissionsDB.deleteTags(query.where?._id.toString())
		return super.delete(query, request)
	}

	apis(pathPart?: string): ServerApi<any>[] {
		return [
			new ServerApi_Delete(this, pathPart),
			new ServerApi_Query(this, pathPart),
			new ServerApi_Unique(this, pathPart),
			new ServerApi_Create(this, pathPart)
		];
	}
}

export const TagsDB = new TagsDB_Class();



