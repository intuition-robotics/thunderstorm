
export class Filter {
	private _filter = "";

	setFilter(filter: string) {
		this._filter = filter;
	}

	getFilter(filter: string) {
		this._filter = filter;
	}

	filter<T>(items: T[], filter: (item: T) => string[]): T[] {
		const filterAsRegexp = this.prepareFilter();

		return items.filter((item) => {
			const keysToFilter = filter(item);
			for (const key of keysToFilter) {
				if (key.toLowerCase().match(filterAsRegexp))
					return true;
			}

			return false;
		});
	}

	private prepareFilter() {
		let filter = this._filter;
		filter = filter.trim();
		filter = filter.toLowerCase();
		filter = filter.replace(/\s+/, " ");
		filter = filter.replace(new RegExp("(.)", "g"), ".*?$1");
		filter.length === 0 ? filter = ".*?" : filter += ".*";

		return new RegExp(filter);
	}
}
