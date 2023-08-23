import {__scenario} from "@intuitionrobotics/testelot";
import {makeFilesPublicTest} from "./tests/test-public";

export const testStorage = __scenario("test-storage");
testStorage.add(makeFilesPublicTest());
