const WebpackEnvConfig = require('./_base.js');
const fs = require('fs');

class DevConfig
	extends WebpackEnvConfig {

	jsxMinify() {
		return false;
	}

	cssMinify() {
		return false;
	}

	outputFolder() {
		return "dev";
	}

	resolveGtmScript() {
		return WebpackEnvConfig._resolveGtmScript("GTM-DEV")
	}

	htmlMinificationOptions() {
	}

	getPrettifierPlugin() {
	}

	getDevServerSSL() {
		return {
			key: fs.readFileSync('./.config/ssl/server-key.pem'),
			cert: fs.readFileSync('./.config/ssl/server-cert.pem'),
			// ca: fs.readFileSync('/path/to/ca.pem')
		}
	}

	getHostingPort() {
		return 5001;
	}
}

module.exports = new DevConfig();
