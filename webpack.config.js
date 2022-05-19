const webpackConfig = require('@nextcloud/webpack-vue-config')
const path = require('path')

webpackConfig.output.path = path.resolve(__dirname, '../dist/signup/js/'),

module.exports = webpackConfig
