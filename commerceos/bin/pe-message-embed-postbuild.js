#!/usr/bin/env node

const fs = require('fs-extra');
const concat = require('concat');

(async function build() {
  const files = [
    './dist/apps/message-embed/style.js',
    './dist/apps/message-embed/runtime.js',
    './dist/apps/message-embed/polyfills.js',
  ];
  const main = await fs.readFile("./dist/apps/message-embed/main.js", "utf-8");

  const style = await fs.readFile("./dist/apps/message-embed/styles.css", "utf-8");
  const wrapper = `var style = document.createElement('style');
  //version 10
        style.innerHTML = '.cdk-overlay-container {z-index: 1000000!important;}${style.replace(/\n/g, '')}';
        document.head.appendChild(style);

        var link = document.createElement('script');
        link.setAttribute('src', 'http://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js');
        link.onload = function() {
          WebFont.load({
            google: {
              families: ['Roboto:300,400,500']
            }
          });
        };
        document.head.appendChild(link);

        var scriptPeStatic = document.createElement('script');
        scriptPeStatic.src = 'MICRO_URL_TRANSLATION_STORAGE/js/pe-static.js';
        scriptPeStatic.onload = function() {
          window?.PayeverStatic?.IconLoader?.loadIcons([
              'apps',
              'commerceos',
              'messaging',
              'set',
          ]);

          ${main}
        };
        document.head.appendChild(scriptPeStatic);

        var msg = document.createElement('pe-message-webcomponent');
        msg.setAttribute('channels', (window.channels || ""));
        msg.setAttribute('business', (window.business || ""));
        document.body.appendChild(msg);`;

  await fs.writeFile('./dist/apps/message-embed/style.js', wrapper);

  await fs.ensureDir('dist');
  await fs.mkdirSync('dist/libs/message/', { recursive: true });
  await concat(files, 'dist/libs/message/pe-message-widget.min.js');
})();
