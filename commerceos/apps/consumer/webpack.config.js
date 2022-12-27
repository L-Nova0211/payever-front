const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');

/**
 * This is a server config which should be merged on top of common config
 */
module.exports = () => {
  return {
    watch: false,
    devtool: 'eval',
    mode: 'production',
    externals: [
      'pino-pretty',
      'fast-json-stringify',
      'elastic-apm-node',
      'amqp-ts',
      'amqp',
      'yargs',
    ],
    entry: {
      '../../dist/builder-client/server/consumer': './apps/consumer/src/main.ts',
    },
    resolve: {
      modules: ['src', 'node_modules', 'libs'],
      extensions: ['.ts', '.js', '.json'],
      alias: {
        '@pe/builder-client-helpers': path.resolve(__dirname, '../../libs/client/helpers/src'),
        '@pe/builder-core': path.resolve(__dirname, '../../libs/builder/core/src'),
      },
    },
    output: {
      // Puts the output at the root of the dist folder
      path: path.join(__dirname),
      filename: '[name].js',
      libraryTarget: 'umd',
    },
    module: {
      rules: [
        { test: /[\/\\]@angular[\/\\].+\.js$/, parser: { system: true } },
        {
          test: /(?!(spec))\.(ts|tsx)?$/,
          include: [
            path.resolve(__dirname, 'src'),
            path.resolve(__dirname, '../../libs'),
          ],
          use: [
            {
              loader: 'ts-loader',
              options: {
                configFile: 'tsconfig.app.json',
              },
            },
          ],
        },
      ],
    },
    plugins: [
      new webpack.ContextReplacementPlugin(
        // fixes WARNING Critical dependency: the request of a dependency is an expression
        /(.+)?angular(\\|\/)core(.+)?/,
        path.join(__dirname, 'src'), // location of your src
        {}, // a map of your routes
      ),
      new webpack.ContextReplacementPlugin(
        // fixes WARNING Critical dependency: the request of a dependency is an expression
        /(.+)?express(\\|\/)(.+)?/,
        path.join(__dirname, 'src'),
        {},
      ),
      // Without this row - build error
      new webpack.IgnorePlugin(/vertx/),
    ],
    target: 'node',
    node: {
      __dirname: false,
    },
  };
};
