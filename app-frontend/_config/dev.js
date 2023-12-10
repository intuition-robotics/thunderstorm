const WebpackEnvConfig = require('./_base.js');
const HtmlBeautifyPlugin = require('html-beautify-webpack-plugin');
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
		return new HtmlBeautifyPlugin({
			config: {
				html: {
					end_with_newline: true,
					indent_size: 2,
					indent_with_tabs: true,
					indent_inner_html: true,
					preserve_newlines: true,
					unformatted: [
						'i',
						'b',
						'span'
					]
				}
			},
			replace: [' type="text/javascript"']
		})
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
