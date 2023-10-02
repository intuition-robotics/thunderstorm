/*
 * ts-common is the basic building blocks of our typescript projects
 *
 * Copyright (C) 2020 Intuition Robotics
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Backend_ModulePack_Permissions} from "../main/backend";
import {StormTester} from "@intuitionrobotics/thunderstorm/backend-test";
import {__scenario} from "@intuitionrobotics/testelot";
import {createTwoAccessLevels} from "./tests/create-project";
import {
	checkAccessLevelsPropertyOfGroup,
	checkCreateUserWithEmptyGroups,
	checkCreateUserWithGroups,
	checkDeleteAccessLevelsDocument,
	checkGroupAccessLevelsAfterPatchingLevelDocument,
	checkGroupAccessLevelsAfterUpdatingLevelDocument,
	checkInsertUserIfNotExist,
	checkInsertUserIfNotExistByExistUser,
	checkPatchOfGroupAccessLevelsProperty,
	checkPatchOfGroupAccessLevelsPropertyToHigherValue,
	checkUpdateOfGroupAccessLevelsProperty,
	checkUpdateOfGroupAccessLevelsPropertyToHigherValue,
	createApi,
	createApiWithAccessLevel,
	createGroupWithLegalCustomField,
	createTowGroups,
	createTowUsers,
	createUser,
	createUserWithDuplicateGroupIdButDifferentCustomField,
	createUserWithGroups,
	failedCreateApi,
	failedCreateGroupWithDuplicateAccessLevel,
	failedCreateTwoGroupsWithSameName,
	failedCreateUserWithDuplicateGroups,
	failToCreateGroupWithIllegalCustomField,
	tryDeleteAccessLevelAssociatedWithApi,
	tryDeleteAccessLevelAssociatedWithGroup,
	tryDeleteDomainAssociatedWithAccessLevel,
	checkUpdatedUserGroups,
	failedDeleteGroupAssociatedToUser,
	failedCreateUserWithDuplicateGroupsButOneUndefinedCFAndOtherEmptyObj
} from "./tests/permissions-manage";
import {
	permissionsAssertDoesCustomFieldsSatisfiesTests,
	permissionsAssertIsLevelsMatchTests
} from "./tests/permissions-assert";
import { FirebaseModule } from "@intuitionrobotics/firebase/backend";
import { AccountModule } from "@intuitionrobotics/user-account/backend";
import {
	assignUserPermissionsTests
} from "./tests/assign-permissions";
import {
	expectToFailTestFullAssertUserPermissionsWithNonGroupCFCovered,
	expectToFailTestFullAssertUserPermissionsWithNonGroupCFRegValueCovered,
	expectToFailTestFullAssertUserPermissionsWithNonGroupCFValueCovered,
	testFullAssertUserPermissionsWithEmptyUserCFsArrayAndEmptyRequestCFObj,
	testFullAssertUserPermissionsWithExtraGroupCFCovered
} from "./tests/full-permission-user-assert";
import { SecretsModule } from "@intuitionrobotics/user-account/app-backend/modules/SecretsModule";


export const mainScenario = __scenario("Permissions");

mainScenario.add(createUser());
mainScenario.add(createUserWithGroups());
mainScenario.add(createTowUsers());

mainScenario.add(failedDeleteGroupAssociatedToUser());

mainScenario.add(failedCreateUserWithDuplicateGroups());
mainScenario.add(createUserWithDuplicateGroupIdButDifferentCustomField());

mainScenario.add(createTwoAccessLevels());
mainScenario.add(createApi());
mainScenario.add(failedCreateApi());
mainScenario.add(checkCreateUserWithGroups());
mainScenario.add(checkCreateUserWithEmptyGroups());
mainScenario.add(checkAccessLevelsPropertyOfGroup());
mainScenario.add(checkUpdatedUserGroups());
mainScenario.add(checkUpdateOfGroupAccessLevelsProperty());
mainScenario.add(checkUpdateOfGroupAccessLevelsPropertyToHigherValue());
mainScenario.add(checkPatchOfGroupAccessLevelsProperty());
mainScenario.add(checkGroupAccessLevelsAfterPatchingLevelDocument());
mainScenario.add(checkPatchOfGroupAccessLevelsPropertyToHigherValue());
mainScenario.add(checkGroupAccessLevelsAfterUpdatingLevelDocument());
mainScenario.add(createTowGroups());
mainScenario.add(createGroupWithLegalCustomField());
mainScenario.add(failToCreateGroupWithIllegalCustomField());
mainScenario.add(failedCreateTwoGroupsWithSameName());
mainScenario.add(failedCreateGroupWithDuplicateAccessLevel());
mainScenario.add(failedCreateUserWithDuplicateGroupsButOneUndefinedCFAndOtherEmptyObj());
mainScenario.add(createApiWithAccessLevel());

mainScenario.add(permissionsAssertIsLevelsMatchTests());
mainScenario.add(permissionsAssertDoesCustomFieldsSatisfiesTests());

mainScenario.add(tryDeleteDomainAssociatedWithAccessLevel());
mainScenario.add(tryDeleteAccessLevelAssociatedWithGroup());
mainScenario.add(tryDeleteAccessLevelAssociatedWithApi());
mainScenario.add(checkDeleteAccessLevelsDocument());

mainScenario.add(checkInsertUserIfNotExist());
mainScenario.add(checkInsertUserIfNotExistByExistUser());

mainScenario.add(assignUserPermissionsTests());

mainScenario.add(testFullAssertUserPermissionsWithExtraGroupCFCovered());
mainScenario.add(testFullAssertUserPermissionsWithEmptyUserCFsArrayAndEmptyRequestCFObj());
mainScenario.add(expectToFailTestFullAssertUserPermissionsWithNonGroupCFCovered());
mainScenario.add(expectToFailTestFullAssertUserPermissionsWithNonGroupCFValueCovered());
mainScenario.add(expectToFailTestFullAssertUserPermissionsWithNonGroupCFRegValueCovered());


module.exports = new StormTester()
	.addModules(FirebaseModule, AccountModule, SecretsModule)
	.setConfig({
		SecretsModule: {
			secrets: {
				AUTH_SECRET: "abc"
			}
		}
	})
	.addModules(...Backend_ModulePack_Permissions)
	.setScenario(mainScenario)
	.build();





