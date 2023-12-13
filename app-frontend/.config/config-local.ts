
export const config = {
	XhrHttpModule: {
		origin: "http://127.0.0.1:5002/ir-thunderstorm-dev/us-central1/api",
		timeout: 30000,
		compress: false
	},
	FirebaseModule: {
		local: {
			apiKey: "AIzaSyC7oQCgSOtI-tBM-AUGVeq3Mms6T9wgkKM",
			authDomain: "local-ts-testing-alan.firebaseapp.com",
			databaseURL: "https://local-ts-testing-alan.firebaseio.com",
			projectId: "local-ts-testing-alan",
			storageBucket: "local-ts-testing-alan.appspot.com",
			messagingSenderId: "278437548852",
			appId: "1:278437548852:web:5e33e4c12174b60eb98b61",
			measurementId: "G-MNTQ9CCT9K"
		},
	},
	PushPubSubModule: {
		publicKeyBase64: 'BMDTPilO0jte6ADpa0VNzY300AXBZNXClyOUHD9ZfJNByuTtQ6c1rDTSIfLnX8SNgsgaL8skhqaAeiDaYNZeOpg',
		registerOnInit: false
	},
	ForceUpgrade: {
		assertVersionUrl: "/v1/version/assert"
	},
	LocaleModule: {
		defaultLocale: "en",
		locales: [
			{
				locale: "en",
				label: "Language_English",
				icon: "languages/en",
				texts: require(`./res/localization/en`)
			},
			{
				locale: "nl",
				label: "Language_Dutch",
				icon: "languages/nl",
				texts: require(`./res/localization/nl`)
			}
		]
	}
};
