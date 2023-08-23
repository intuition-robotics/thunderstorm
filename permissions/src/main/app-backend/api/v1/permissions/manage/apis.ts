import {
    AccessLevelPermissionsDB,
    ApiPermissionsDB,
    DomainPermissionsDB,
    ProjectPermissionsDB
} from "../../../../modules/db-types/managment";

module.exports = [
    ...ProjectPermissionsDB.apis(),
    ...DomainPermissionsDB.apis(),
    ...AccessLevelPermissionsDB.apis(),
    ...ApiPermissionsDB.apis()
];
