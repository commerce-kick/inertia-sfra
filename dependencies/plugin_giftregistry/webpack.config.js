'use strict';

var path = require('path');
var MiniCssExtractPlugin = require('mini-css-extract-plugin');
var sgmfScripts = require('sgmf-scripts');
var RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts');

module.exports = [
    {
        mode: 'production',
        name: 'js',
        entry: sgmfScripts.createJsPath(),
        output: {
            path: path.resolve(
                './cartridges/plugin_giftregistry/cartridge/static'
            ),
            filename: '[name].js'
        },
        resolve: {
            alias: {
                cleave: path.resolve(
                    __dirname,
                    '../storefront-reference-architecture/node_modules/cleave.js'
                )
            }
        }
    },
    {
        mode: 'none',
        name: 'scss',
        entry: sgmfScripts.createScssPath(),
        output: {
            path: path.resolve(
                './cartridges/plugin_giftregistry/cartridge/static'
            )
        },
        module: {
            rules: [
                {
                    test: /\.scss$/,
                    use: [
                        {
                            loader: MiniCssExtractPlugin.loader,
                            options: {
                                esModule: false
                            }
                        },
                        {
                            loader: 'css-loader',
                            options: {
                                url: false
                            }
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                postcssOptions: {
                                    plugins: [require('autoprefixer')()]
                                }
                            }
                        },
                        {
                            loader: 'sass-loader',
                            options: {
                                implementation: require('sass'),
                                sassOptions: {
                                    includePaths: [
                                        path.resolve(
                                            process.cwd(),
                                            '../storefront-reference-architecture/node_modules/'
                                        ),
                                        path.resolve(
                                            process.cwd(),
                                            '../storefront-reference-architecture/node_modules/flag-icons/sass'
                                        )
                                    ]
                                }
                            }
                        }
                    ]
                }
            ]
        },
        plugins: [
            new RemoveEmptyScriptsPlugin(),
            new MiniCssExtractPlugin({
                filename: '[name].css',
                chunkFilename: '[name].css'
            })
        ]
    }
];
