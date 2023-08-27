
export class ContextKey<T> {
	public readonly key: string;
	public defaultValue?: T;

	constructor(key: string, defaultValue?: T) {
		this.key = key;
		this.defaultValue = defaultValue;
	}
}

export class TypedHashMap {

	private map: Map<string, any> = new Map<string, any>();

	delete(key: ContextKey<any>) {
		return this.map.delete(key.key);
	}

	get<ValueType>(key: ContextKey<ValueType>) {
		return this.map.get(key.key) as ValueType;
	}

	set<ValueType>(key: ContextKey<ValueType>, value: ValueType) {
		return this.map.set(key.key, value);
}

	clear() {
		return this.map.clear();
	}
}

