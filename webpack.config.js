const webpackConfig = require('@nextcloud/webpack-vue-config')
const path = require('path')
const webpack = require('webpack')

webpackConfig.output.filename = 'nextcloud-register-main.js'
webpackConfig.output.path = path.join(__dirname, '../dist/signup/js/')

webpackConfig.devServer = {
	static: [
		{
			directory: path.join(__dirname, 'public'),
		},
		{
			directory: path.join(__dirname, '../dist/signup/js/'),
			publicPath: '/js',
		}
	],
	compress: true,
	port: 9000,
}

if (process.env.NODE_ENV === 'production') {
	webpackConfig.mode = 'production'
	webpackConfig.plugins.push(new webpack.DefinePlugin({ providersUrl: JSON.stringify('/wp-json/signup/providers') }))
} else {
	webpackConfig.mode = 'development'
	// For testing purposes
	webpackConfig.plugins.push(new webpack.DefinePlugin({ providersUrl: JSON.stringify('/preferred.json') }))
}

module.exports = webpackConfig
