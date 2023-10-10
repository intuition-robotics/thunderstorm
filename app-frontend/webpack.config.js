const path = require('path');
const HtmlWebPackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const {WebpackManifestPlugin} = require("webpack-manifest-plugin");
const versionApp = require('../version-app.json');
const webpack = require("webpack");
const sourcePath = path.join(__dirname, './src');
const mainFolder = path.join(__dirname, './src/main/');
const mainConfig = path.join(__dirname, './src/main/tsconfig.json');

module.exports = (env, argv) => {

	console.log("argv: " + JSON.stringify(argv));
	env = argv.mode === "development" ? "dev" : "prod"
	const envConfig = require(`./_config/${env}`);
	const outputFolder = path.resolve(__dirname, `dist/${envConfig.outputFolder()}`);

	return {
		context: sourcePath,
		target: ["web", "es2017"],
		entry: {
			main: './main/index.tsx'
		},
		output: {
			path: outputFolder,
			filename: '[name].js',
			publicPath: '/',
			clean: true
		},
		devtool: "source-map",
		devServer: {
			historyApiFallback: true,
			compress: true,
			static: outputFolder,
			server: {type: "https", options:envConfig.getDevServerSSL() },
			port: envConfig.getHostingPort(),
		},
		resolve: {
			fallback: {
				"fs": false,
				"tls": false,
				"net": false,
				"path": false,
				"buffer": require.resolve("buffer/"),
				"zlib": require.resolve("browserify-zlib"),
				"util": require.resolve("util/"),
				"http": false,
				"https": false,
				"stream": require.resolve("stream-browserify"),
				"crypto": require.resolve("crypto-browserify"),
			},
			alias: {
				"@modules": path.resolve(__dirname, "src/main/modules"),
				"@consts": path.resolve(__dirname, "src/main/consts"),
				"@components": path.resolve(__dirname, "src/main/ui/components"),
				"@renderers": path.resolve(__dirname, "src/main/ui/renderers"),
				"@styles": path.resolve(__dirname, "src/main/res/styles"),
				"@res": path.resolve(__dirname, "src/main/res"),
				// "@utils": path.resolve(__dirname, "src/main/utils")
			},
			extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
			symlinks: false
		},
		module: {
			rules: [
				{
					test: /main\/.+\.tsx?$/,
					include: [mainFolder],
					use: {
						loader: "ts-loader",
						options: {
							configFile: mainConfig
						}
					}
				},
				{enforce: "pre", test: /\.js$/, loader: "source-map-loader", exclude: [/node_modules/, /dist/, /build/, /__test__/]},
				{
					test: /\.[ot]tf$/,
					use: [
						{
							loader: 'url-loader',
							options: {
								limit: 10000,
								mimetype: 'application/octet-stream',
								name: 'fonts/[name].[ext]',
							}
						}
					]
				},
				{
					test: /\.json$/,
					exclude: /node_modules/,
				},
				{
					test: /\.(jpe?g|png|gif|ico|svg)$/i,
					type: 'asset/resource'
				},
				{
					test: /\.s?[c|a]ss$/,
					use: [
						'style-loader',
						MiniCssExtractPlugin.loader,
						// Translates CSS into CommonJS
						"css-loader",
						// Compiles Sass to CSS
						"sass-loader",
					]
				}
			]
		},
		plugins: [
			new webpack.DefinePlugin({
				'process.env': {
					'appEnv': `"${env}"`,
					'appVersion': `"${versionApp.version}"`
				}
			}),
			new CleanWebpackPlugin({cleanStaleWebpackAssets: false}),
			new MiniCssExtractPlugin({
				filename: 'main/res/styles.[contenthash].css',
			}),
			new HtmlWebPackPlugin({
				inject: true,
				template: "./main/index.ejs",
				filename: "./index.html",
				minify: envConfig.htmlMinificationOptions()
			}),
			new WebpackManifestPlugin()
		].filter(plugin => plugin)
	};
};
