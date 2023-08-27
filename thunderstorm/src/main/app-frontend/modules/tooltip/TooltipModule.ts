
import * as React from "react";
import {Module} from "@intuitionrobotics/ts-common/core/module";
import {ThunderDispatcher} from "../../core/thunder-dispatcher";
import {Stylable, StylableBuilder} from "../../tools/Stylable";
import {Second} from "@intuitionrobotics/ts-common/utils/date-time-tools";

export type  Tooltip_Model = Stylable & {
    content: React.ReactNode;
    location?: {
        x: number,
        y: number
    };
    duration: number;
};

export interface TooltipListener {
    __showTooltip(tooltip?: Tooltip_Model): void;
}

const dispatch_showTooltip = new ThunderDispatcher<TooltipListener, "__showTooltip">("__showTooltip");
const Interval_DefaultTooltip = 6 * Second;

export class TooltipModule_Class
    extends Module<{}> {

    constructor() {
        super("TooltipModule");
    }

    show = (tooltip: Tooltip_Model, e?: MouseEvent) => {
        if (!tooltip.location && e)
            tooltip.location = {x: e.pageX + 10, y: e.pageY + 15};

        dispatch_showTooltip.dispatchUI([tooltip])
    };

    hide = () => dispatch_showTooltip.dispatchUI([]);
}

export const TooltipModule = new TooltipModule_Class();

export class TooltipBuilder
    extends StylableBuilder {

    private readonly content: React.ReactNode;
    private location = {x: 0, y: 0};
    private duration: number = Interval_DefaultTooltip;

    constructor(content: React.ReactNode, e?: React.MouseEvent) {
        super();

        this.content = content;
        if (e)
            this.location = {
                x: e.pageX + 10,
                y: e.pageY + 15
            }
    }

    setLocation = (x: number, y: number) => {
        this.location = {x, y};
        return this;
    };


    setDuration = (duration: number) => {
        this.duration = duration;
        return this;
    };

    show = () => {
        const model: Tooltip_Model = {
            content: this.content,
            location: this.location,
            style: this.style,
            className: this.className,
            duration: this.duration,
        };

        TooltipModule.show(model)
    }
}

