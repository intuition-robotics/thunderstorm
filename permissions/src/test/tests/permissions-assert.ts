import {__custom, __scenario, TestException} from "@intuitionrobotics/testelot";
import {generateHex} from "@intuitionrobotics/ts-common/utils/random-tools";
import {StringMap} from "@intuitionrobotics/ts-common/utils/types";
import {
    GroupPairWithBaseLevelsObj,
    PermissionsAssert,
    RequestPairWithLevelsObj
} from "../../main/app-backend/modules/permissions-assert";
import {testLevel1, testLevel2} from "./_core";

const customField1 = {unit: 'eq1'};
const domainId1 = generateHex(32);
const domainId2 = generateHex(32);
const lowerLevel = {...testLevel1, value: 100, domainId: domainId1};
const higherLevel = {...testLevel2, value: 200, domainId: domainId1};
const higherLevelDifferentDomain = {...testLevel2, value: 200, domainId: domainId2};
const requestPairWithLowerLevelsObj = {accessLevels: [lowerLevel], customFields: [customField1]}
const requestPairWithHigherLevelsObj = {accessLevels: [higherLevel, lowerLevel], customFields: [customField1]}
const groupPairWithLowerLevelsObj = {accessLevels: [lowerLevel], customFields: [customField1]}
const groupPairWithHigherLevelsObj = {accessLevels: [higherLevel, lowerLevel], customFields: [customField1]}
const groupPairWithHigherLevelsObjDifferentDomain = {
    accessLevels: [higherLevelDifferentDomain],
    customFields: [customField1]
}

type PermissionsAssert = {
    label: string
    request: RequestPairWithLevelsObj
    group: GroupPairWithBaseLevelsObj
    expected: boolean
}

type CustomFieldModel = {
    label: string
    request: StringMap
    group: StringMap[]
    expected: boolean
}

const models: PermissionsAssert[] = [
    {
        label: "Check basic permissions with a higher group level object",
        group: groupPairWithHigherLevelsObj,
        request: requestPairWithLowerLevelsObj,
        expected: true
    }, {
        label: "Check basic permissions with a equal group level object",
        group: groupPairWithLowerLevelsObj,
        request: requestPairWithLowerLevelsObj,
        expected: true
    }, {
        label: "Check basic permissions with a lower level",
        group: groupPairWithLowerLevelsObj,
        request: requestPairWithHigherLevelsObj,
        expected: false
    }, {
        label: "Check basic permissions with a higher from different domain object",
        group: groupPairWithHigherLevelsObjDifferentDomain,
        request: requestPairWithLowerLevelsObj,
        expected: false
    },
];

const customFieldsModels: CustomFieldModel[] = [
    {
        label: "Check if group customFields satisfies the request custom field",
        group: [{unit: 'eq1'}],
        request: {unit: 'eq1'},
        expected: true
    }, {
        label: "Check if group customFields satisfies the request custom field in case group customField property is substring of request customField property",
        group: [{unit: 'eq1'}],
        request: {unit: 'eq11'},
        expected: false
    }, {
        label: "Check if group customFields satisfies the request custom field in case request customField property is substring of group customField property",
        group: [{unit: 'eq11'}],
        request: {unit: 'eq1'},
        expected: false
    }, {
        label: "Check if group customFields with match RegEx satisfies the request custom field",
        group: [{unit: 'eq[1-2]'}],
        request: {unit: 'eq1'},
        expected: true
    }, {
        label: "Check if group customFields with many RegEx satisfies the request custom field",
        group: [{unit: 'eq[2-3]'}, {unit: 'eq[4-5]'}],
        request: {unit: 'eq1'},
        expected: false
    }, {
        label: "Check if group customFields with match RegEx satisfies the request custom field - pass with regEx sign",
        group: [{unit: '^eq[1-2]$'}],
        request: {unit: 'eq1'},
        expected: true
    }, {
        label: "Check if group customFields with many RegEx satisfies the request custom field - pass with regEx sign",
        group: [{unit: '^eq[2-3]$'}, {unit: '^eq[4-5]$'}],
        request: {unit: 'eq1'},
        expected: false
    }, {
        label: "Check if group customFields with many RegEx satisfies the request custom field",
        group: [{unit: 'eq[1-3]'}, {unit: 'eq[4-5]'}],
        request: {unit: 'eq1'},
        expected: true
    }, {
        label: "Check if group customFields with not match RegEx satisfies the request custom field",
        group: [{unit: 'eq[2-3]'}],
        request: {unit: 'eq1'},
        expected: false
    }, {
        label: "Check if empty request custom field be accepted",
        group: [{unit: 'eq[2-3]'}],
        request: {},
        expected: true
    }, {
        label: "Check if empty group custom field be accepted",
        group: [],
        request: {unit: 'eq1'},
        expected: false
    }, {
        label: "Check if empty request & group custom field be accepted",
        group: [],
        request: {},
        expected: true
    }
];

export function permissionsAssertIsLevelsMatchTests() {
    const scenario = __scenario("Permissions assert - is levels match");
    let satisfy;
    for (const model of models) {
        scenario.add(__custom(async () => {
            satisfy = await PermissionsAssert.isMatchWithLevelsObj(model.group, model.request);
            if (satisfy !== model.expected)
                throw new TestException(`Expect permissions levels is match to be ${model.expected}, but you got ${!model.expected}`);
        }).setLabel(model.label));
    }

    return scenario;
}

export function permissionsAssertDoesCustomFieldsSatisfiesTests() {
    const scenario = __scenario("Permissions assert - custom fields");
    let satisfy;
    for (const model of customFieldsModels) {
        scenario.add(__custom(async () => {
            satisfy = await PermissionsAssert.doesCustomFieldsSatisfies(model.group, model.request);
            if (satisfy !== model.expected)
                throw new TestException(`Expect permissions levels doesCustomFieldsSatisfies to be ${model.expected}, but you got ${!model.expected}`);
        }).setLabel(model.label));
    }

    return scenario;
}
