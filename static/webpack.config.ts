import * as path from 'path';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';
import * as ExtractTextPlugin from 'extract-text-webpack-plugin';
import * as webpack from 'webpack';

const HtmlWebPackPlugin = require('html-webpack-plugin');

const CopyWebpackPlugin = require('copy-webpack-plugin');

const config: webpack.Configuration = {
  mode: 'production',

  entry: {
    'js/pe-static': './src/pe-static',
    'js/pe-payment-widget-loader': './src/pe-payment-widget-loader',
    'js/polyfills': './src/polyfills',
    'js/polyfills-no-ie': './src/polyfills-no-ie',
    'js/polyfills-common': './src/polyfills-common',
    'js/polyfills-zonejs': './src/polyfills-zonejs',
    'js/polyfills-zonejs-es5': './src/polyfills-zonejs-es5',
    'js/polyfills-zonejs-es2015': './src/polyfills-zonejs-es2015',
    'js/polyfills-ie': './src/polyfills-ie',
    'js/polyfills-custom-elements': './src/polyfills-custom-elements',
    'js/tmetrix': './src/tmetrix',
    'fields/input': './src/fields/input',
    'fields/input-iban': './src/fields/input-iban',
  },

  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].js',
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: ['css-loader', 'sass-loader'],
        }),
        //   ExtractTextPlugin.extract({
        //   fallback: 'style-loader',
        //   use: ['css-loader', 'sass-loader']
        // })
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader',
            options: { minimize: false }
          }
        ]
      }
    ],
  },

  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: './tsconfig.json',
        extensions: ['.ts', '.tsx'],
      }),
    ],
  },

  plugins: [
    new CopyWebpackPlugin([
      { from: 'node_modules/roboto-fontface/fonts', to: 'fonts' },
    ]),
    new HtmlWebPackPlugin({
      template: './index.html',
      filename: './index.html',
    }),
    new HtmlWebPackPlugin({
      template: './dist/preview/index.html',
      filename: './preview.html',
    }),
    new HtmlWebPackPlugin({
      template: './dist/preview-svg/index.html',
      filename: './preview-svg.html',
    }),
    new HtmlWebPackPlugin({
      template: './dist/payment-widget-demo/index.html',
      filename: './payment-widget-demo.html',
    }),
  ],
};

export default config;
