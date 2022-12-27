#!/usr/bin/env node

const fse = require('fs-extra');

const getFilesInPath = (path) => {
  return fse.readdirSync(path);
};

const jsPath = './dist/fields';
const jsFiles = getFilesInPath(jsPath);

for (const jsFileName of jsFiles) {

  if (jsFileName.indexOf('.js') < 0) continue;

  let jsContent = fse.readFileSync(`${jsPath}/${jsFileName}`, "utf-8");
  const content = `
<head>
  <link href="https://fonts.googleapis.com/css?family=Roboto:300&display=swap" rel="stylesheet">
</head>
<body></body>
<script type="application/javascript">${jsContent}</script>
`;

  const htmlFileName = `${jsPath}/${jsFileName.replace('.js', '.html')}`;
  fse.createFileSync(htmlFileName);
  fse.writeFile(htmlFileName, content, err => {
    if (err) {
      console.error(`Error with html file generated`, htmlFileName, err);
    } else {
      console.log(`Html file generated`, htmlFileName);
    }
  })

}
