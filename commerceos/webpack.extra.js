const webpack = require('webpack');
const { RetryChunkLoadPlugin } = require('webpack-retry-chunk-load-plugin');

module.exports = {
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new RetryChunkLoadPlugin({
      cacheBust: `function() {
        return Date.now();
      }`,
      retryDelay: 3000,
      maxRetries: 5,
      lastResortScript: "window.location.reload();",
    }),
  ],
}
