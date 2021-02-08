const path = require('path');

/* config-overrides.js */
module.exports = function override(config, env) {
  config.resolve.alias = {
    ...config.resolve.alias,
    '@assets': path.resolve(__dirname, './src/assets'),
    '@components': path.resolve(__dirname, './src/components'),
    '@containers': path.resolve(__dirname, './src/containers'),
    '@lib': path.resolve(__dirname, './src/lib'),
    '@pages': path.resolve(__dirname, './src/pages'),
    '@routes': path.resolve(__dirname, './src/routes'),
    '@services': path.resolve(__dirname, './src/services'),
    '@store': path.resolve(__dirname, './src/store'),
    '@styles': path.resolve(__dirname, './src/styles'),
    '@utils': path.resolve(__dirname, './src/utils'),
    '@models': path.resolve(__dirname, './src/models')
  };

  // do stuff with the webpack config...
  return config;
};
