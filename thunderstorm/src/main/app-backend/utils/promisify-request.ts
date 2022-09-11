/*
 * Thunderstorm is a full web app framework!
 *
 * Typescript & Express backend infrastructure that natively runs on firebase function
 * Typescript & React frontend infrastructure
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


import {ApiException} from "../exceptions";
import {__stringify} from "@intuitionrobotics/ts-common";
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
