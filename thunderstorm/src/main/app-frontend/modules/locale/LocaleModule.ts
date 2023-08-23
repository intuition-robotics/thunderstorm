import {
	Locale,
	LocaleDef,
	StringKey
} from "./types";
import {format} from "util";
import {ThunderDispatcher} from "../../core/thunder-dispatcher";
import {StorageKey} from "../StorageModule";
import { Module } from "@intuitionrobotics/ts-common/core/module";
import { ImplementationMissingException } from "@intuitionrobotics/ts-common/core/exceptions";

type Config = {
	defaultLocale: Locale,
	locales: LocaleDef[],
};

export interface LanguageChangeListener {
	__onLanguageChanged(): void;
}

const dispatch_onLanguageChanged = new ThunderDispatcher<LanguageChangeListener, "__onLanguageChanged">("__onLanguageChanged");

export class LocaleModule_Class
	extends Module<Config> {

	constructor() {
		super("LocaleModule");
	}

	private activeLocale!: LocaleDef;
	private defaultLocale!: LocaleDef;
	private selectedLanguage: StorageKey<string> = new StorageKey<string>("locale--selected-language");

	protected init() {
		const defaultLocale = this.selectedLanguage.get() || this.config.defaultLocale;
		if (!defaultLocale)
			throw new ImplementationMissingException("MUST set defaultLocale in the config data");

		this.defaultLocale = this.setLanguage(defaultLocale);
	}

	public setLanguage(locale: Locale) {
		const localeDef = this.config.locales.find(_locale => _locale.locale === locale);
		if (!localeDef)
			throw new ImplementationMissingException(`Unsupported language: ${locale}`);

		this.activeLocale = localeDef;
		dispatch_onLanguageChanged.dispatchUI([]);
		this.selectedLanguage.set(localeDef.locale);
		return localeDef
	}

	public getAvailableLanguages(): LocaleDef[] {
		return this.config.locales;
	}

	public get(key: StringKey, ...params: any[]) {
		let text = this.activeLocale.texts[key];

		if (!text)
			text = this.defaultLocale.texts[key];

		if (!text)
			return key;

		return format(text, ...params);
	}
}

export const LocaleModule = new LocaleModule_Class();
