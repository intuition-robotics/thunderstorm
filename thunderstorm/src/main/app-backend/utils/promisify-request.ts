import {ApiException} from "../exceptions";
import {__stringify} from "@intuitionrobotics/ts-common/utils/tools";
import axios, {
	AxiosRequestConfig,
	AxiosResponse
} from "axios";

export async function promisifyRequest(_request: AxiosRequestConfig): Promise<AxiosResponse> {
	try {
		return await axios.request(_request);
	} catch (error) {
		const resp = error.response;
		if (resp) {
			// The request was made and the server responded with a status code
			// that falls out of the range of 2xx
			return resp;
		}

		// if (error.request)
		// The request was made but no response was received
		// `error.request` is an instance of XMLHttpRequest in the browser and an instance of
		// http.ClientRequest in node.js

		throw new ApiException(503, `Error: ${__stringify(error)}\n Request: ${__stringify(_request, true)}`)

		// Something happened in setting up the request that triggered an Error
		// console.log('Error', error.message);
		//
		// console.log(error.config);
	}
}
