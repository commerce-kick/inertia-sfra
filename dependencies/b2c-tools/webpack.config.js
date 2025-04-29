// This webpack configuration is used to build a single-file executable version
// of b2c-tools. It is not necessary for normal execution (i.e. as a node module)

const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: './cli.js',
    mode: 'development',
    target: 'node',
    devtool: false,
    externalsPresets: { node: true },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'b2c-tools.js',
        library: {
            type: 'commonjs',
        },
    },
    module: {
        rules: [
            {
                test: /.node$/,
                loader: 'node-loader',
            }
        ]
    },
    plugins: [
        new webpack.BannerPlugin({ banner: "#!/usr/bin/env node", raw: true }),
        // define the environment variables
        new webpack.DefinePlugin({
            'process.env': {
                'BUNDLED': JSON.stringify(true),
            },
            // bundled output will not have require.main as it normally does
            // set to the executing filename
            'require.main.filename': 'process.argv[1]',
        }),
    ]
};