import {ServerApi} from "@intuitionrobotics/thunderstorm/app-backend/modules/server/server-api";
import {GroupPermissionsDB, UserPermissionsDB} from "../../../../modules/db-types/assign";


const assignmentApis: ServerApi<any>[] = [...GroupPermissionsDB.apis(), ...UserPermissionsDB.apis()];

module.exports = assignmentApis;
