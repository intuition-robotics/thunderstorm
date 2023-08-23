export type StringKey = string;
export type Locale = string;

export type LocaleDef = {
	locale: Locale,
	label: StringKey,
	icon: string,
	texts: { [k: string]: string }
};

