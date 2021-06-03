"use strict";
module.exports = {
    entry: './build/abp-filter-parser.js',
    output: {
        filename: 'abp-filter-parser-packed.js',
        path: __dirname + '/build',
        library: "ABPFilterParser"
    },
    node: {
        fs: 'empty'
    }
};
//# sourceMappingURL=webpack-abp-filter-parser.config-es2015.js.map