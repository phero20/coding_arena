const fs = require('fs');
const path = require('path');

function findFiles(dir, filter, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const stat = fs.statSync(path.join(dir, file));
    if (stat.isDirectory()) findFiles(path.join(dir, file), filter, fileList);
    else if (filter.test(file)) fileList.push(path.join(dir, file));
  }
  return fileList;
}

const basePath = process.cwd() + '/web/src/components';
const files = findFiles(basePath, /\.tsx$/);
const extracted = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const regex = /^(?:export\s+)?(?:interface|type)\s+[A-Za-z]+Props\s*(?:<[^>]+>)?\s*(?:extends[^{]+)?(?:\{[\s\S]*?\n\}|=[^;]+;)/gm;
  let match;
  while ((match = regex.exec(content)) !== null) {
      extracted.push('// ' + path.basename(file));
      extracted.push('export ' + match[0].replace(/^export\s+/, ''));
  }
}

fs.writeFileSync(process.cwd() + '/web/src/types/component.types.ts', extracted.join('\n\n'));
console.log('Extracted ' + extracted.length + ' blocks to component.types.ts');
