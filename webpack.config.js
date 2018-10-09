const path = require('path');

module.exports = {
    entry: './editor-src/Main.js',
    output: {
        minify : "false",
        filename: 'Main.js',
        path: path.resolve(__dirname, './public/javascripts')
    }
};
