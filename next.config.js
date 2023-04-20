const path = require('path');

module.exports = {
  env: {
    NEXTAUTH_URL: "http://localhost:3000",
  },
  webpack(config) {
    config.resolve.alias['~'] = path.resolve(__dirname);
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|svg)$/,
      loader: 'url-loader',
      options: {
        limit: 100000,
      },
    });
    return config;
  },
};
