const path = require('path');

module.exports = {
    entry: './editor-src/Main.js',

    resolve: {
        extensions: ['.js'],
        alias: {
            "three": "three.js"
        }
    },

    externals: {
        three: "THREE"
    },
    
    output: {
        filename: 'Main.js',
        path: path.resolve(__dirname, './public/javascripts')
    }
};
