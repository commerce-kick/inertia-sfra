'use strict';

var path = require('path');
var sgmfScripts = require('sgmf-scripts');

module.exports = [{
    mode: 'production',
    name: 'js',
    entry: sgmfScripts.createJsPath(),
    output: {
        path: path.resolve('./cartridges/lib_productlist/cartridge/static'),
        filename: '[name].js'
    }
}];
