const path = require('path');

module.exports = {
    entry: './dist/main.js',
    output: {
        path: path.resolve(__dirname, 'build')
    },
    target: 'node'
};
