/*
 * Permissions management system, define access level for each of
 * your server apis, and restrict users by giving them access levels
 *
 * Copyright (C) 2020 Adam van der Kruk aka TacB0sS
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

import * as React from "react";
import {BaseComponent} from "@nu-art/thunderstorm/frontend";
import {ScaleLinear} from "d3-scale";

type Props = {
	xScale: ScaleLinear<number, number, any>,
	height: number,
	ticks?: number,
	tickValues?: string[],
	placeInMiddle?: boolean
}

export class AxisBottom
	extends BaseComponent<Props, {}> {

	constructor(props: Props) {
		super(props);
	}

	axisBottom = () => {
		const textPaddingY = 10;
		// const textPaddingX = this.props.textPaddingX || 0

		const axis = this.props.xScale.ticks(this.props.ticks).map((d, i) => (
			<g className="x-tick" key={i}>
				<line
					style={{stroke: "#e4e5eb"}}
					y1={0}
					y2={this.props.height}
					x1={this.props.xScale(d)}
					x2={this.props.xScale(d)}
				/>
				<text
					style={{textAnchor: "middle", fontSize: 12}}
					dy=".71em"
					x={this.props.placeInMiddle ? this.props.xScale(d) + ((this.props.xScale(this.props.xScale.ticks(this.props.ticks)[i + 1]) - this.props.xScale(d))/ 2) : this.props.xScale(d)}
					y={this.props.height + textPaddingY}
				>
					{this.props.tickValues ? this.props.tickValues[d] : d}
				</text>
			</g>
		));
		return <>{axis}</>;
	};

	render() {
		return this.axisBottom();
	}

}


export default AxisBottom;