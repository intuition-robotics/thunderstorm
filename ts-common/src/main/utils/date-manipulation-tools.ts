import {Timestamp} from "./types";
import {utc} from "moment/moment";
import {currentTimeMillies, Format_HHmmss_DDMMYYYY} from "./date-time-tools";

export function createReadableTimestampObject(pattern: string = Format_HHmmss_DDMMYYYY, timestamp: number = currentTimeMillies(), timezone?: string) {

    const timeObj: Timestamp = {
        timestamp: timestamp,
        pretty: formatTimestamp(pattern, timestamp)
    };

    if (timezone)
        timeObj.timezone = timezone;

    return timeObj;
}

export function formatTimestamp(pattern: string = Format_HHmmss_DDMMYYYY, timestamp: number = currentTimeMillies(), timezone?: string) {
    const m = utc(timestamp);
    if (timezone) {
        m.utcOffset(timezone);
    }
    return m.format(pattern);
}

export function parseTimeString(timestamp: string, pattern: string = Format_HHmmss_DDMMYYYY): number {
    return utc(timestamp, pattern).valueOf();
}
