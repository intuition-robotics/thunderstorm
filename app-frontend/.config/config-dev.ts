
export const config = {
	XhrHttpModule: {
		// origin: "http://192.168.1.5:3000",
		origin: "http://localhost:5002/thunderstorm-staging/us-central1/api",
		timeout: 30000,
		compress: false
	},
	frontend: {
		// origin: "http://192.168.1.5:3010",
		origin: "http://localhost:5001",
	},
	FirebaseModule: {
		local: {
			apiKey: "AIzaSyD2xhGl4-gq3L_rknxoYF0KZLvedrFWQbg",
			authDomain: "thunderstorm-staging.firebaseapp.com",
			databaseURL: "https://thunderstorm-staging.firebaseio.com",
			projectId: "thunderstorm-staging",
			storageBucket: "thunderstorm-staging.appspot.com",
			messagingSenderId: "387990980732",
			appId: "1:387990980732:web:62ce3fe05f0fc852faa1f9",
			measurementId: "G-PSCS2QH5YV"
		}
	},
	PushPubSubModule: {
		publicKeyBase64: 'BBsKBw0R-mITlCSAOtCiHCLvKl-EetCmt5JKMg8L8ev1GqBEpDryum8ve3htIlbN3cjV1MLDFQnk0a8Wfks7cFk'
	},
	ExampleModule: {
		remoteUrl: "/v1/sample/endpoint-example"
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
