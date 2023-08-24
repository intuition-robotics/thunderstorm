const WebpackEnvConfig = require('./_base.js');

class ProdConfig
	extends WebpackEnvConfig {

	jsxMinify() {
		"".format(443,"sfs")
		return true;
	}

	cssMinify() {
		return true;
	}

	outputFolder() {
		return "prod";
	}

	resolveGtmScript() {
		return WebpackEnvConfig._resolveGtmScript("GTM-PROD")
	}

	htmlMinificationOptions() {
		return {
			removeComments: true,
			collapseWhitespace: true,
			removeRedundantAttributes: true,
			useShortDoctype: true,
			removeEmptyAttributes: true,
			removeStyleLinkTypeAttributes: true,
			keepClosingSlash: true,
			minifyJS: true,
			minifyCSS: true,
			minifyURLs: true
		};
	}

	getPrettifierPlugin() {
	}

	getDevServerSSL() {
	}

	getServerPort() {
		return 5000;
	}
}

module.exports = new ProdConfig();
