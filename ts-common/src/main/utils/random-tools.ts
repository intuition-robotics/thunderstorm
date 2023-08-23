import {randomBytes} from 'crypto';

export function generateHex(length: number) {
	return randomBytes(Math.ceil(length / 2))
		.toString('hex')
		.slice(0, length).toLowerCase();
}

export function generateUUID() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
}
