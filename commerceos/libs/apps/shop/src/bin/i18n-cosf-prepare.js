#!/usr/bin/env node

const { exec } = require('child_process');

exec('pe-i18n-cli prepare --domain-prefix=shop --input-path=./node_modules/@pe/builder-shop/assets/locale --prepare-path=dist/translations', function (error, stdout, stderr) {
  console.log(stdout);
  console.error(stderr);
  if (error !== null) {
    console.error('Exec error: ' + error);
  }
});
