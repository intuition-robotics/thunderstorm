import {StormTester} from "@intuitionrobotics/thunderstorm/test-backend/StormTester";
import {__scenario} from "@intuitionrobotics/testelot";
import {FirebaseModule} from "@intuitionrobotics/firebase/app-backend/FirebaseModule";
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
	checkUpdatedUserGroups,
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
	failedCreateUserWithDuplicateGroupsButOneUndefinedCFAndOtherEmptyObj,
	failedDeleteGroupAssociatedToUser,
	failToCreateGroupWithIllegalCustomField,
	tryDeleteAccessLevelAssociatedWithApi,
	tryDeleteAccessLevelAssociatedWithGroup,
	tryDeleteDomainAssociatedWithAccessLevel
} from "./tests/permissions-manage";
import {
	permissionsAssertDoesCustomFieldsSatisfiesTests,
	permissionsAssertIsLevelsMatchTests
} from "./tests/permissions-assert";
import {assignUserPermissionsTests} from "./tests/assign-permissions";
import {
	expectToFailTestFullAssertUserPermissionsWithNonGroupCFCovered,
	expectToFailTestFullAssertUserPermissionsWithNonGroupCFRegValueCovered,
	expectToFailTestFullAssertUserPermissionsWithNonGroupCFValueCovered,
	testFullAssertUserPermissionsWithEmptyUserCFsArrayAndEmptyRequestCFObj,
	testFullAssertUserPermissionsWithExtraGroupCFCovered
} from "./tests/full-permission-user-assert";
import {AccountModule} from "@intuitionrobotics/user-account/app-backend/modules/AccountModule";
import {Backend_ModulePack_Permissions} from "../main/app-backend/core/module-pack";


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
    .addModules(FirebaseModule)
    .addModules(AccountModule)
    .addModules(...Backend_ModulePack_Permissions)
    .setScenario(mainScenario)
    .build();





