
import {
	ApiWithBody,
	ApiWithQuery
} from "@intuitionrobotics/thunderstorm/shared/types";

export type CommonBodyReq = {
	message: string
}

export type ParamsToGet = {
	param1: string
}

export type CustomError1 = {
	prop1: string
	prop2: string
}

export type CustomError2 = {
	prop3: string
	prop4: string
}

export interface TestDispatch {
	testDispatch: () => void;
}

export type ExampleApiCustomError = ApiWithBody<"/v1/sample/custom-error", void, void, CustomError1 | CustomError2>
export type ExampleApiPostType = ApiWithBody<"/v1/sample/another-endpoint", CommonBodyReq, string>
export type ExampleApiGetType = ApiWithQuery<string, string>
export type ExampleApiTest = ApiWithQuery<string, string>
export type ExampleTestPush = ApiWithQuery<"/v1/sample/push-test", string>

export type ExampleGetMax = ApiWithQuery<"/v1/sample/get-max", { n: number }>
export type ExampleSetMax = ApiWithBody<"/v1/sample/set-max", { n: number }, void>
export type ApiType_GetWithoutParams = ApiWithQuery<"/v1/sample/get-without-params-endpoint", string>
export type ApiType_ApiGetWithParams = ApiWithQuery<"/v1/sample/get-with-params-endpoint", string, ParamsToGet>
export type ApiType_ApiPostWithoutResponse = ApiWithBody<"/v1/sample/post-without-body-endpoint", CommonBodyReq, void>
export type ApiType_ApiPostWithResponse = ApiWithBody<"/v1/sample/post-with-body-endpoint", CommonBodyReq, string>
