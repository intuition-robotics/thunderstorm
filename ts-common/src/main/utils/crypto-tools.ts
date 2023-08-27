
import {createHmac} from "crypto";

export function randomNumber(range: number) {
	return Math.floor(Math.random() * (range))
}

export function randomObject<T>(items: T[]): T {
	return items[randomNumber(items.length)];
}

export function hashPasswordWithSalt(salt: string | Buffer, password: string | Buffer) {
	return createHmac('sha512', salt)
		.update(password)
		.digest('hex');
}
