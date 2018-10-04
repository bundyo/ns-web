const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {VueLoaderPlugin} = require('vue-loader');

module.exports = {
    mode: 'development',

    entry: './app/app.js',

    output: {
        path: path.resolve(__dirname, './dist'),
        filename: '[name].js',
        publicPath: '/'
    },

    module: {
        rules: [{
            test: /\.css$/,
            use: [
                {
                    loader: 'vue-style-loader',
                    options: {
                        shadowMode: true
                    }
                },
                'css-loader'
            ]
        }, {
            test: /\.vue$/,
            loader: 'vue-loader',
            options: {
                loaders: {},
                shadowMode: true
                // other vue-loader options go here
            }
        },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.(png|jpg|gif|svg)$/,
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]?[hash]'
                }
            }
        ]
    },
    plugins: [
        new VueLoaderPlugin(),
        new HtmlWebpackPlugin({
            template: 'src/assets/index.html'
        })
    ],
    resolve: {
        modules: [
            path.resolve(__dirname, "app"),
            "node_modules",
            path.resolve(__dirname, "src/web-modules"),
            path.resolve(__dirname, "src/tns-core-modules")],
        alias: {
            application: "application.web.js",
            "http": "http/http.js",
            "connectivity": "connectivity/connectivity-common.js",
            "application-settings": "application-settings/application-settings-common.js",
            "file-system/file-name-resolver": path.resolve(__dirname, "src/tnsm/file-system/file-name-resolver.js"),
            "file-system": path.resolve(__dirname, "src/tnsm/file-system/file-system.js"),
            "data/observable": "data/observable/observable.js",
            "data/observable-array": "data/observable-array/observable-array.js",
            "data/virtual-array": "data/virtual-array/virtual-array.js",
            "ui/core/view": "ui/core/view-common.js",
            "ui/frame": "ui/frame/frame.web.js",
            "ui/page": "ui/page/page-common.js",
            "ui/image": "ui/image/image-common.js",
            "ui/image-cache": "ui/image-cache/image-cache-common.js",
            "ui/action-bar": "ui/action-bar/action-bar-common.js",
            "ui/builder/special-properties": path.resolve(__dirname, "src/tnsm/ui/builder/special-properties.js"),
            "ui/builder/component-builder": path.resolve(__dirname, "src/tnsm/ui/builder/component-builder.js"),
            "ui/builder": "ui/builder/builder.js",
            "ui/content-view": "ui/content-view/content-view.js",
            "ui/dialogs": "ui/dialogs/dialogs-common.js",
            "ui/enums": "ui/enums/enums.js",
            "ui/editable-text-base": "ui/editable-text-base/editable-text-base-common.js",
            "ui/gestures": "ui/gestures/gestures-common.js",
            "ui/button": "ui/button/button-common.js",
            "ui/label": "ui/label/label-common.js",
            "ui/animation/keyframe-animation": path.resolve(__dirname, "src/tnsm/ui/animation/keyframe-animation.js"),
            "ui/animation": "ui/animation/animation-common.js",
            "ui/layouts/layout-base": "ui/layouts/layout-base-common.js",
            "ui/layouts/dock-layout": "ui/layouts/dock-layout/dock-layout-common.js",
            "ui/layouts/absolute-layout": "ui/layouts/absolute-layout/absolute-layout-common.js",
            "ui/layouts/stack-layout": "ui/layouts/stack-layout/stack-layout-common.js",
            "ui/layouts/grid-layout": "ui/layouts/grid-layout/grid-layout-common.js",
            "ui/layouts/wrap-layout": "ui/layouts/wrap-layout/wrap-layout-common.js",
            "ui/styling/background": path.resolve(__dirname, "src/tnsm/ui/styling/background-common.js"),
            "ui/styling/css-selector": path.resolve(__dirname, "src/tnsm/ui/styling/css-selector.js"),
            "ui/styling/font": path.resolve(__dirname, "src/tnsm/ui/styling/font-common.js"),
            "ui/styling/style": path.resolve(__dirname, "src/tnsm/ui/styling/style.js"),
            "ui/styling/style-scope": path.resolve(__dirname, "src/tnsm/ui/styling/style-scope.js"),
            "ui/styling/style-property": path.resolve(__dirname, "src/tnsm/ui/styling/style-property.js"),
            "ui/styling": "ui/styling/styling.js",
            "ui/text-base": "ui/text-base/text-base-common.js",
            "ui/text-field": "ui/text-field/text-field-common.js",
            "text/formatted-string": "text/formatted-string-common.js",
            "image-source": "image-source/image-source-common.js",
            "xml": "xml/xml.js",
            "xhr": "xhr/xhr.js",
            "timer": "timer/timer.js",
            "console": "console/console.js",
            "fetch": "fetch/fetch.js",
            "trace": "trace/trace.js",
            "utils/types": path.resolve(__dirname, "src/tnsm/utils/types.js"),
            "utils/utils": path.resolve(__dirname, "src/tnsm/utils/utils-common.js"),
            "js-libs/easysax": "js-libs/easysax/easysax.js",
            "js-libs/esprima": "js-libs/esprima/esprima.js",
            "js-libs/polymer-expressions/path-parser": path.resolve(__dirname, "src/tnsm/js-libs/polymer-expressions/path-parser.js"),
            "js-libs/polymer-expressions": "js-libs/polymer-expressions/polymer-expressions.js",
            'vue$': 'vue/dist/vue.esm.js',
        },
        extensions: ['*', '.js', '.vue', '.json']
    },
    devServer: {
        historyApiFallback: true,
        noInfo: false,
        overlay: true
    },
    performance: {
        hints: false
    },
    devtool: '#eval-source-map'
};

if (process.env.NODE_ENV === 'production') {
    module.exports.devtool = '#source-map';
    // http://vue-loader.vuejs.org/en/workflow/production.html
    module.exports.plugins = (module.exports.plugins || []).concat([
        new VueLoaderPlugin(),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"production"'
            }
        }),
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: true,
            compress: {
                warnings: false
            }
        }),
        new webpack.LoaderOptionsPlugin({
            minimize: true
        })
    ])
}
