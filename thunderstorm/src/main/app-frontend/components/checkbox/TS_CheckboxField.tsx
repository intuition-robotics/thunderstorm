
import * as React from "react";
import {Component, ReactNode} from "react";
import {TS_Checkbox} from "./TS_Checkbox";

export type CheckboxOption<T> = {
    value: T
    disabled?: boolean
}

type LabelType = ReactNode | ((checked: boolean, disabled: boolean) => ReactNode)

export type CheckboxFieldProps<T> = {
    id?: string
    options: CheckboxOption<T>[]
    value: T | T[]
    label: (option: CheckboxOption<T>) => LabelType
    circle?: boolean
    rtl?: boolean
    onCheck: (value: T, checked: boolean) => void
    fieldContainerClass?: string
    gridColumns?: number
    horizontal?: boolean
    buttonClass?: (checked: boolean, disabled: boolean) => string
    checkboxContainerClass?: (checked: boolean, disabled: boolean) => string
    innerNode?: (checked: boolean, disabled: boolean) => ReactNode
}

export class TS_CheckboxField<T>
    extends Component<CheckboxFieldProps<T>, {}> {

    gridCss = (): React.CSSProperties => {
        if (this.props.gridColumns)
            return {display: "grid",
                gridAutoFlow: this.props.horizontal ? "unset" : "column",
                gridGap: "1px",
                gridTemplateColumns: `repeat(${this.props.gridColumns}, 1fr)`,
                gridTemplateRows: `repeat(${Math.ceil(this.props.options.length/this.props.gridColumns)}, auto)`
            }
        return {}
    }

    render() {
        return <div className={`${this.props.fieldContainerClass} ${this.props.horizontal && !this.props.gridColumns ? 'll_h_c' : ''}`} style={this.gridCss()}>
            {this.props.options.map((option, i: number) =>
                <TS_Checkbox
                    key={i}
                    value={option.value}
                    checked={Array.isArray(this.props.value) ? this.props.value.includes(option.value) : this.props.value === option.value}
                    onCheck={this.props.onCheck}
                    label={this.props.label(option)}
                    circle={this.props.circle}
                    rtl={this.props.rtl}
                    disabled={option.disabled}
                    buttonClass={this.props.buttonClass}
                    containerClass={this.props.checkboxContainerClass}
                    innerNode={this.props.innerNode}
                />
            )}
        </div>;
    }

}
