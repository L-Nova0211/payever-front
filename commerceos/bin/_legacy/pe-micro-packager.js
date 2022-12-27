#!/usr/bin/env node

const yargs = require('yargs');
const fs = require('fs');
const path = require('path');
const Hashids = require('hashids');

const argv = yargs.argv;
const distPath = argv._[0] || './dist';
const deployPath = argv._[1] || 'deploy';
const microConfig = 'micro.config.json';
const envConfig = 'env.json';

const buildHash = (new Hashids()).encode(Math.floor(new Date() / 1000));
const outputBuildFileName = path.join(distPath, `micro.js`);
const outputHashmapFileName = path.join(distPath, `hashmap.json`);
const outputMicroConfigFileName = path.join(distPath, microConfig);
const outputEnvConfigFileName = path.join(distPath, envConfig);

// Make webpack bundle unique with same hash
console.log(`Making webpack bundle unique using hash ${buildHash}...`);
mapDistJs(function(filePath) {
  replace(filePath, '__webpack_require__', buildHash);
  replace(filePath, 'webpackJsonp', buildHash);
});

function concat(files, destination, callback) {
  var concatted = '';
  for (var i = 0; i < files.length; i++) {
    concatted += fs.readFileSync(path.resolve(files[i]), 'utf8');
    concatted += "\r\n";
  }
  fs.writeFileSync(path.resolve(destination), concatted);
  callback(null);
}

if (argv.resolveCssScope !== 'false') {
  // NOTE this code is disabled to allow launch apps with angular from CDN,
  // Because of changing of scope do not needed if use @angular/compiler from CDN

  // Resolving css-scope conflicts
  console.log(`Fixing css class conflicts issue by replacing '_nghost' with '_nghost-${buildHash}'`);
  mapDistJs(function (filePath) {
      replace(filePath, '_nghost', `-${buildHash}`);
  });
}

// Add hashes to .js files link  inside index.html
findIndexHtml(function(filePath) {
  replaceWithRegexp(filePath, /\.js/g, '.js', `?${buildHash}`);
});

// Concat files in exact order (polyfills excluded because they should be only once per page)
const filesToConcat = [];
mapDistJs(function(filePath) {
  if (/^runtime/.test(path.basename(filePath))) {

    /* NOTE: runtime.js files contais names and hashes of lazy modules.
      But we can use --output-hashing=none. And to avoid browser cache issue we have to add hash as get param to
      the lazy modules links.
      Runtime.js updated synchronously
    */
    let runtimeContent = fs.readFileSync(path.resolve(filePath), 'utf8');
    runtimeContent = runtimeContent.replace('.js', '.js?' + buildHash);
    fs.writeFileSync(path.resolve(filePath), runtimeContent);
    console.log('Runtime.js file udpated. Added hash to chunks.');

    filesToConcat.push(filePath);
  }
});
mapDistJs(function(filePath) {
  if (/^scripts/.test(path.basename(filePath))) {
    filesToConcat.push(filePath);
  }
});
mapDistJs(function(filePath) {
  if (/^common/.test(path.basename(filePath))) {
    filesToConcat.push(filePath);
  }
});
mapDistJs(function(filePath) {
  if (/^main/.test(path.basename(filePath))) {
    filesToConcat.push(filePath);
  }
});

concat(filesToConcat, outputBuildFileName, function(err) {
  if (err) throw err;
  console.log(`Packed ${filesToConcat.join(", ")} to ${outputBuildFileName}`);
});

// Write hash map
fs.writeFileSync(outputHashmapFileName, JSON.stringify({
  micro: buildHash
}));

console.log(`Created hashmap file ${outputHashmapFileName}`);

// Create micro.config.json file from template
let microConfigJson;
try {
  microConfigJson = require(path.resolve(`./${deployPath}/${microConfig}`));
} catch (e) {
  console.log('Please provide the AppRegistry file for micro-frontend application (micro.config.json)');
}
if (microConfigJson) {
  const dataWithHash = JSON.stringify(microConfigJson).replace(/{hash}/g, buildHash);

  // Write micro.config.json
  fs.writeFileSync(outputMicroConfigFileName, dataWithHash);
  console.log(`Created AppRegistry config file ${outputMicroConfigFileName}`);
}

// Create env.json file from template
let envConfigJson;
try {
  envConfigJson = require(path.resolve(`./${deployPath}/${envConfig}`));
} catch (e) {
  console.log('Please provide the environment config file for micro-frontend application (env.json)');
}
if (envConfigJson) {
  const envConfigData = JSON.stringify(envConfigJson);

  // Write config.json
  fs.writeFileSync(outputEnvConfigFileName, envConfigData);
  console.log(`Created environment config file ${outputEnvConfigFileName}`);
}

/*** Utils ***/

function replaceWithRegexp(file, searchRegexp, searchString, hash) {
  const content = fs.readFileSync(file, 'utf8');
  const result = content.replace(searchRegexp, searchString + hash);
  fs.writeFileSync(file, result);
}

function replace(file, searchString, hash) {
  const content = fs.readFileSync(file, 'utf8');
  const searchRegexp = new RegExp(searchString, 'g');
  const result = content.replace(searchRegexp, searchString + hash);
  fs.writeFileSync(file, result);
}

function mapDistJs(callback) {
  const files = fs.readdirSync(distPath);
  // console.log(files);
  for (file of files) {
    const filePath = path.join(distPath, file);
    const extname = path.extname(filePath);
    if (extname === '.js') {
      callback(filePath);
    }
  }
}

function findIndexHtml(callback, name) {
  name = name || 'index.html';
  const files = fs.readdirSync(distPath);
  for (file of files) {
    const filePath = path.join(distPath, file);
    const fileName = path.basename(filePath).toLowerCase();
    if (fileName === name) {
      callback(filePath);
    }
  }
}
