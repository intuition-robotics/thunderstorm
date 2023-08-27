
export function padNumber(num: number | string, length: number): string {
	const _num = num.toString();
	return _num.length < length ? padNumber("0" + _num, length) : _num;
}
