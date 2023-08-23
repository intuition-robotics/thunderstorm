import {_keys} from "@intuitionrobotics/ts-common/utils/object-tools";
import {JiraQuery, QueryItemWithOperator} from "./JiraModule";

export type JiraIssueText = string | { href: string, text: string };

function createText(...texts: JiraIssueText[]) {
    return {
        type: "doc",
        version: 1,
        content: [
            {
                type: "paragraph",
                content: texts.map(text => {
                    if (typeof text === "string")
                        return {
                            type: "text",
                            text
                        };

                    return {
                        type: "text",
                        text: text.text,
                        marks: [
                            {
                                type: "link",
                                attrs: {
                                    href: text.href
                                }
                            }
                        ]
                    }

                })
            }
        ]
    };
}

function buildJQL(query: JiraQuery) {
    const params = _keys(query).map((key) => {
        let queryValue;
        let operator = '=';
        if (Array.isArray(query[key])) {
            queryValue = (query[key] as string[]).map(value => `"${value}"`).join(",");
            queryValue = `(${queryValue})`;
        } else if (typeof query[key] === 'object') {
            const queryItemWithOperator = query[key] as QueryItemWithOperator;
            queryValue = `"${queryItemWithOperator.value}"`
            operator = queryItemWithOperator.operator;
        } else
            queryValue = `"${query[key]}"`;

        return `${key}${operator}${queryValue}`;
    });
    return params.join(" and ");
};

export const JiraUtils = {
    createText,
    buildJQL,
};
