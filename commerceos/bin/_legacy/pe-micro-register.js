#!/usr/bin/env node

const https = require('https');
const http = require('http');
const path = require('path');
const yargs = require('yargs');

const env = yargs.argv['env'] || 'prod';
const config = yargs.argv['config'] || 'micro.config.json';

const appRegistryConfig = {
  serve: {
    hostname: 'localhost',
    port: 3012
  },
  dev: {
    hostname: 'app-registry.devpayever.com',
    port: 443
  },
  stage: {
    hostname: 'app-registry-staging.devpayever.com',
    port: 443
  },
  prod: {
    hostname: 'app-registry.payever.org',
    port: 443
  }
};

try {
  let configJson;
  let microHashJson;
  try {
    configJson = require(path.resolve(`./${config}`));
    console.log(configJson);
  } catch (e) {
    throw new Error('Please provide the config file for micro-frontend application (micro.config.json)');
  }
  try {
    microHashJson = require(path.resolve('./dist/hashmap.json'));
  } catch (e) {
    throw new Error('hashmap.json file is abcent in dist folder. Please make sure that you have made the app build before running micro-registry script');
  }
  const dataWithHash = JSON.stringify(configJson).replace('{hash}', microHashJson.micro);
  registerMicro(dataWithHash);
} catch (error) {
  console.error(error.message.red);
}

function registerMicro(data) {
  let options = getRequestOptions(appRegistryConfig[env], data);
  let req = (env === 'serve' ? http : https).request(options, (res) => {
    switch (res.statusCode) {
      case 201:
        console.log(`Micro app was successfully registered.`.green);
        break;
      case 400:
        throw new Error('Failed. Please check the config interface.');
      default:
        throw new Error(`Failed. Unexpected status code: ${res.statusCode}`);
    }
  });
  req.write(data);
}

function getRequestOptions(options, data) {
  const baseOptions = {
    method: 'POST',
    path: '/api/apps',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };
  return Object.assign({}, baseOptions, options);
}
