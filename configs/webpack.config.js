const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const isDebug = process.env.NODE_ENV !== "production";
const PROJECT_ROOT = path.resolve(__dirname, '..');

const config = {
    entry: {
        core: path.resolve(PROJECT_ROOT, 'src/default.js'),
        agenda: path.resolve(PROJECT_ROOT, 'src/agenda.js'),
        styles: path.resolve(PROJECT_ROOT, 'src/blocks/index.css'),
    },

    output: {
        path: path.resolve(PROJECT_ROOT, 'build'),
        publicPath: '',
        filename: '[name].js',
    },

    module: {
        rules: [
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        {
                            loader: 'css-loader',
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                config: path.resolve(__dirname, 'postcss.config.js'),
                            },
                        },
                    ],
                }),
            },
            {
                test: /\.(png|jpg|gif)$/,
                loader: 'url-loader',
                query: {
                    limit: 10000,
                },
            },
        ],
    },

    plugins: [
        new ExtractTextPlugin('styles.css'),

        ...isDebug ? [] : [
            // Minimize all JavaScript output of chunks
            // https://github.com/mishoo/UglifyJS2#compressor-options
            new webpack.optimize.UglifyJsPlugin({
                sourceMap: true,
                compress: {
                    screw_ie8: true,
                    warnings: false,
                    unused: true,
                    dead_code: true,
                },
                mangle: {
                    screw_ie8: true,
                },
                output: {
                    comments: false,
                    screw_ie8: true,
                },
            }),
        ],
    ],

    target: 'web',
};


module.exports = config;
