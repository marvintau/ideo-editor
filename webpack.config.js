const path = require('path');

module.exports = {
    entry: './editor-src/Main.js',
    output: {
        filename: 'Main.js',
        path: path.resolve(__dirname, './public/javascripts')
    }
};
