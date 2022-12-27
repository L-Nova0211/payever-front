#!/usr/bin/env node

const yargs = require('yargs');
const fs = require('fs');
const path = require('path');
const lodash = require('lodash');

const argv = yargs.argv;
const srcKey = '___PE_CUSTOM_LOCALE_KEY___';
const localeKey = argv._[0];
const distPath = argv._[1] || './dist';

// Make webpack bundle unique with same hash
console.log(`Replacing ${srcKey} key to the ${localeKey} inside js files...`);

function processRecursivelyInDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (file of files) {
    const filePath = path.join(dir, file);
    const extname = path.extname(filePath);
    if (extname === '.js') {
      console.log('Processing file', filePath);
      replace(filePath, srcKey, localeKey);
    }
  }
}
processRecursivelyInDirectory(distPath);

/*** Utils ***/

function replace(file, searchString, hash) {
  const content = fs.readFileSync(file, 'utf8');
  const searchRegexp = new RegExp(lodash.escapeRegExp(searchString), 'g');
  const result = content.replace(searchRegexp, hash);
  fs.writeFileSync(file, result);
}
