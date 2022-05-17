const path = require('path')
const HtmlPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const Dotenv = require('dotenv-webpack')
module.exports = {
	mode: 'development',
	entry: {
		main: './js/main.js',
	},
	output: {
		path: path.resolve(__dirname, 'dist'), 
		filename: 'main.js', 
		clean: true 
	}, 
	module: {
		rules: [
			{
				test: /\.s?css$/,
				use: [
					'style-loader',
					'css-loader',
					'postcss-loader',
					'sass-loader'
				]
			},
			{
				test: /\.js$/,
				use: [
					'babel-loader'
				]
			}
		]
	},
	plugins: [
		new HtmlPlugin({
			template: './index.html'
		}),
		new CopyPlugin({
			patterns: [
				{ from: 'static' },
			]
		}),
		new Dotenv({systemvars: true})
	],
	devServer: {
		host: 'localhost',
		port: 8079,
		hot: true
	}
}