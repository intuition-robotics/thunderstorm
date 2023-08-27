import {createReadableTimestampObject} from "./date-manipulation-tools";
import {AuditBy} from "./types";

export const Second = 1000;
export const Minute = Second * 60;
export const Hour = Minute * 60;
export const Day = Hour * 24;
export const Week = Day * 7;

export const Format_HHmmss_DDMMYYYY = "HH:mm:ss_DD-MM-YYYY";
export const Format_YYYYMMDD_HHmmss = "YYYY-MM-DD_HH:mm:ss";

export type TimerHandler = (...args: any[]) => void;

export async function timeout(sleepMs: number) {
    return new Promise(resolve => setTimeout(resolve, sleepMs, undefined));
}

export function _setTimeout(handler: TimerHandler, sleepMs = 0, ...args: any[]): number {
    return setTimeout(handler, sleepMs, ...args) as unknown as number;
}

export function _clearTimeout(handlerId?: number) {
    if (!handlerId)
        return;
    return clearTimeout(handlerId as unknown as ReturnType<typeof setTimeout>);
}

export function _setInterval(handler: TimerHandler, sleepMs = 0, ...args: any[]) {
    return setInterval(handler, sleepMs, ...args) as unknown as number;
}

export function _clearInterval(handlerId?: number) {
    if (!handlerId)
        return;
    return clearInterval(handlerId as unknown as ReturnType<typeof setInterval>);
}

export function auditBy(user: string, comment?: string, timestamp: number = currentTimeMillies()): AuditBy {
    const _auditBy: AuditBy = {
        auditBy: user,
        auditAt: createReadableTimestampObject(Format_HHmmss_DDMMYYYY, timestamp)
    };

    if (comment)
        _auditBy.comment = comment;
    return _auditBy;
}

export function currentTimeMillies() {
    const date = new Date();
    return date.getTime();
}

export function currentLocalTimeMillies() {
    const date = new Date();
    return date.getTime();
}

export function currentTimeMilliesWithTimeZone() {
    const date = new Date();
    return date.getTime() + date.getTimezoneOffset();
}

