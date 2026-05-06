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

let processedCount = 0;

for (const file of files) {
  // Skip shadcn ui folder!
  if (file.includes(path.join('src', 'components', 'ui'))) {
    continue;
  }
  
  let content = fs.readFileSync(file, 'utf8');
  const regex = /^(?:export\s+)?(?:interface|type)\s+([A-Za-z]+(Props|Option|Filter))\s*(?:<[^>]+>)?\s*(?:extends[^{]+)?(?:\{[\s\S]*?\n\}|=[^;]+;)\s*?\n*/gm;
  
  const extractedTypes = [];
  let match;
  let matchesFound = false;

  // We have to iterate and replace. We use replace with a tracking function.
  content = content.replace(regex, (fullMatch, typeName) => {
    // Only extract Component Props, not generic types or random interfaces, to be safe.
    // The previous script grabbed exactly these to component.types.ts
    matchesFound = true;
    extractedTypes.push(typeName);
    return ''; // Wipe it!
  });

  if (matchesFound && extractedTypes.length > 0) {
    // Inject the import at the end of the imports
    const importStatement = `import type { ${extractedTypes.join(', ')} } from "@/types/component.types";\n`;
    
    // Find the last import statement or 'use client';
    const lines = content.split('\n');
    let lastImportIndex = -1;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('import ') || lines[i].includes('"use client"')) {
            lastImportIndex = i;
        }
    }
    
    if (lastImportIndex !== -1) {
        lines.splice(lastImportIndex + 1, 0, importStatement);
    } else {
        lines.unshift(importStatement);
    }
    
    fs.writeFileSync(file, lines.join('\n'));
    processedCount++;
    console.log(`Updated ${path.basename(file)} with types: ${extractedTypes.join(', ')}`);
  }
}

console.log(`Successfully refactored ${processedCount} files.`);
