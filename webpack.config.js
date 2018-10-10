const { relative, resolve, sep } = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { VueLoaderPlugin } = require('vue-loader');
const NsVueTemplateCompiler = require("nativescript-vue-template-compiler");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const nsWebpack = require("nativescript-dev-webpack");
const nativescriptTarget = require("nativescript-dev-webpack/nativescript-target");

const appComponents = [
    "tns-core-modules/ui/frame",
];

const appPath = "ngapp"; // "ngapp", "vueapp", "app"
const appResourcesPath = appPath + "/App_Resources";

const platform = "web";
const platforms = ["ios", "android", "web"];

const mode = "development";

const appFullPath = resolve(__dirname, appPath);
const appResourcesFullPath = resolve(__dirname, appResourcesPath);

const entryModule = nsWebpack.getEntryModule(appFullPath);
const entryPath = `.${sep}${appPath}${sep}${entryModule}.js`;

console.log(`Bundling application for entryPath ${entryPath}...`);

module.exports = {
    mode: 'development',

    target: nativescriptTarget,

    entry: {
        bundle: entryPath,
    },

    output: {
        path: resolve(__dirname, './dist'),
        filename: '[name].js',
    },

    resolve: {
        modules: [
            resolve(__dirname, appPath),
            resolve(__dirname, "node_modules"),
            resolve(__dirname, "src/node_modules"),
            resolve(__dirname, "src/node_modules/nativescript-angular"),
            resolve(__dirname, "src/node_modules/tns-core-modules")],
        alias: {
            '~': __dirname,
            '@': appFullPath,
            'vue': 'nativescript-vue'
        },
        extensions: ['*', '.js', '.vue', '.json', ".scss", ".css"]
    },

    node: {
        // Disable node shims that conflict with NativeScript
        "fs": "empty",
    },

    module: {
        rules: [{
            test: /\.css$/,
            use: [
                {
                    loader: MiniCssExtractPlugin.loader,
                },
                'css-loader',
                {
                    loader: 'postcss-loader',
                    options: {
                        plugins: () => [
                            require('./postcss-nativescript'),
                            require('autoprefixer')
                        ]
                    }
                },
            ]
        }, {
            test: /\.scss$/,
            use: [
                {
                    loader: MiniCssExtractPlugin.loader,
                },
                'css-loader',
                {
                    loader: 'postcss-loader',
                    options: {
                        plugins: () => [
                            require('./postcss-nativescript'),
                            require('autoprefixer')
                        ]
                    }
                },
                'sass-loader',
            ]
        }, {
            test: new RegExp(entryPath),
            use: [
                //{
                //    loader: "nativescript-dev-webpack/bundle-config-loader",
                //    options: {
                //        registerPages: true, // applicable only for non-angular apps
                //        loadCss: true, // load the application css if in debug mode
                //    },
                //},

                // Require all Android app components
                {
                    loader: "./web-app-components-loader",
                    options: { modules: appComponents },
                },
            ].filter(loader => Boolean(loader)),
        }, {
            test: /\.vue$/,
            loader: 'vue-loader',
            options: {
                compiler: NsVueTemplateCompiler,
            },
        },
        {
            test: /\.html$/,
            loader: 'html-loader'
        },
        {
            test: /\.xml$/,
            loader: 'raw-loader'
        },
        {
            test: /\.(png|jpg|gif|svg)$/,
            loader: 'file-loader',
            options: {
                name: 'images/[name].[ext]?[hash]'
            }
        }]
    },
    plugins: [
        new VueLoaderPlugin(),
        new webpack.DefinePlugin({
            "global.TNS_WEBPACK": "true",
            "TNS_ENV": JSON.stringify(mode),
            "TNS_APPPATH": appPath
        }),
        new HtmlWebpackPlugin({
            template: 'src/assets/index.html'
        }),
        new nsWebpack.GenerateBundleStarterPlugin([
            "./vendor",
            "./bundle",
        ]),
        new nsWebpack.PlatformFSPlugin({
            platform,
            platforms,
        }),
        new MiniCssExtractPlugin({
            filename: "[name].css",
            chunkFilename: "[id].css"
        }),
    ],
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
        //new webpack.optimize.UglifyJsPlugin({
        //    sourceMap: true,
        //    compress: {
        //        warnings: false
        //    }
        //}),
        new CopyWebpackPlugin([
            { from: "fonts/**" },
            { from: "**/*.+(jpg|png)" },
            { from: "assets/**/*" },
        ], { ignore: [ "dist/**/*", "node_modules/**/*", "App_Resources/**/*" ] }),
        new webpack.LoaderOptionsPlugin({
            minimize: true
        })
    ])
}
