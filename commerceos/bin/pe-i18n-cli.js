#!/usr/bin/env node

const yargs = require('yargs');
const path = require('path');

//should be parsed before require of any payever libs
try {
  const envParser = require(path.resolve('env/env.js'));
  envParser.parseToProcess();
} catch(e) {
  console.log('No env parser found. Build is launched without params.');
}

const lib = require('./i18n-tools');
const argv = yargs.argv;
const action = argv._[0];

switch (action) {
  case 'push': {
    lib.push(argv['cleanup']);
    break;
  }
  case 'prepare': {
    lib.prepare();
    break;
  }
  case 'flatten': {
    lib.flatten(argv._[1], argv._[2]);
    break;
  }
}
