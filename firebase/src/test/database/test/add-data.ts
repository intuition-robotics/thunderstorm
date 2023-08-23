import {__scenario} from "@intuitionrobotics/testelot";
import {myDb} from "../_core/database-wrapper";
import {merge} from "@intuitionrobotics/ts-common/utils/merge-tools";
import {assert} from "@intuitionrobotics/ts-common/utils/object-tools";

type ModelDb = {
    path: string
    value: any
    label: string
};

export const scenarioAddData = __scenario("Add data");
const objectPath = 'test/object';
const stringModel = {
    path: 'test/string',
    value: 'hello',
    label: 'Adding a string'
};
const numberModel = {
    path: 'test/number',
    value: 21,
    label: 'Adding a number'
};
const objectModel = {
    path: objectPath,
    value: {a: 1, b: 'cc'},
    label: 'Adding an object'
};
const arrayModel = {
    path: 'test/array',
    value: ['a', 'b', 'c'],
    label: 'Adding an array'
};

const objectModel2 = {
    path: objectPath,
    value: {a: 2},
    label: 'Adding an object'
};

const objectModel3 = {
    path: objectPath,
    value: {
        a: {
            b: 1,
            c: 2
        }
    },
    label: 'Adding an object'
};
const objectModel4 = {
    path: objectPath,
    value: {
        a: {
            c: 3
        }
    },
    label: 'Patching an object'
};

const modelToEscape = {
    path: objectPath,
    value: {
        command: "flash-dsp",
        data: "https://storage.googleapis.com/elliq-env-dev.appspot.com/resources/test/ElliQ_ver2.22_20200629.mbi"
    },
    label: 'Adding an object'
};


const simpleModels: ModelDb[] = [
    stringModel,
    numberModel,
    objectModel,
    arrayModel
];

const addData = (model: ModelDb) => myDb.processDirty(model.label, async db => {
    await db.set<typeof model.value>(model.path, model.value);
    const readVal = await db.get(model.path);
    assert("Values don't match", readVal, model.value);
});

const scenarioSet = myDb.processClean('Set an object over another overwrites', async db => {
    await db.set(objectModel.path, objectModel.value);
    await db.set(objectModel.path, objectModel2.value);
    const readVal = await db.get(objectModel.path);
    assert("Values don't match", readVal, objectModel2.value);
});

const scenarioUpdate = (obj1: ModelDb, obj2: ModelDb) => myDb.processClean('Update an object over another just patches', async db => {
    await db.set(obj1.path, obj1.value);
    await db.patch(obj1.path, obj2.value);
    const actual = await db.get(obj1.path);
    assert("Values don't match", merge(obj1.value, obj2.value), actual);
});

const scenarioEscape = myDb.processDirty('Do I need to escape my values?', async db => {
    await db.set(modelToEscape.path, modelToEscape.value);
});

// simpleModels.forEach(model => scenarioAddData.add(addData(model)))
// scenarioAddData.add(scenarioSet);
// scenarioAddData.add(scenarioEscape);
scenarioAddData.add(scenarioUpdate(objectModel, objectModel2));
// scenarioAddData.add(scenarioUpdate(objectModel3, objectModel4));
