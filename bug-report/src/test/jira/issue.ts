import {
    __custom,
    __scenario
} from "@intuitionrobotics/testelot";
import {JiraModule} from "../../main/app-backend/modules/JiraModule";
import {
    assert,
    generateHex,
    StringMap
} from "@intuitionrobotics/ts-common";

const JSZip = require('jszip');

const baseProject = {
	id: "10030",
	key: "EAT"
};

export const issueScenario = __scenario('Issue');
const mySummary = generateHex(16);
let key: string;
let id: string;
const createIssue = __custom(async () => {
	const resp = await JiraModule.postIssueRequest(baseProject, {name: "Task"}, mySummary, "buggy!");
	key = resp.key;
}).setLabel('Create Issue');

const readIssue = __custom(async () => {
	const resp = await JiraModule.getIssueRequest(key);
	assert(`Summary doesn't match`, mySummary, resp.fields.summary)
}).setLabel('Retrieve issue');

const attachFile = __custom(async () => {
	const zip = new JSZip();
	zip.file('test.txt', generateHex(100));
	const buffer = await zip.generateAsync({type: "nodebuffer"});
	await JiraModule.addIssueAttachment(key, buffer)
}).setLabel('Retrieve issue');

const getIssueTypes = __custom(async () => {
	const resp = await JiraModule.getIssueTypes(baseProject.key);
	console.log(resp)
}).setLabel('Get Issue type');

const addComment = __custom(async () => {
	const resp = await JiraModule.addCommentRequest(id, "updating Alan's unit comments");
	console.log(resp)
}).setLabel('Add comment type');

const searchBySummary = __custom(async () => {
	const map: StringMap = {["cf[10056]"]: "ELQ190112180035"};
	const resp = await JiraModule.getIssueByCustomField(baseProject.key, map);
	id = resp.issues[0].key;
	console.log(id)
}).setLabel('search by summary');

const editFixedVersions = __custom(async () => {
	const fixedVersions = {
		fixVersions:
			[
				{
					name: "V26-1"
				}
			],
	};
	const resp = await JiraModule.editIssue(id, fixedVersions);
	console.log(resp)
}).setLabel('edit an issue');

issueScenario.add(searchBySummary);
issueScenario.add(editFixedVersions);
// issueScenario.add(createIssue);
issueScenario.add(addComment);
// issueScenario.add(readIssue);
// issueScenario.add(attachFile);
// issueScenario.add(getIssueTypes);

