/*
 * Testelot is a typescript scenario composing framework
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

/**
 * Created by IR on 3/18/17.
 */
import {Action} from "./Action";

export class Action_Custom<ParamValue extends any = any, ReturnValue extends any = any>
	extends Action<ParamValue, ReturnValue> {
	private readonly action: (action: Action_Custom, param: ParamValue) => Promise<ReturnValue>;

	protected constructor(action: (action: Action_Custom, param: ParamValue) => Promise<ReturnValue>) {
		super(Action_Custom);
		this.action = action;
	}

	protected async execute(param: ParamValue): Promise<ReturnValue> {
		return await this.action(this, param);
	}
}
