const path = require('path');

module.exports = function override(config, env) {
    config.output = {
        ...config.output,
        path: path.resolve(__dirname, 'build'),
        filename: '[name].js',
    };
    return config;
};
