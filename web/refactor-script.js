const fs = require('fs');

const content = fs.readFileSync('c:/Feroz/MainProjects/coding-arena/new/coding_arena/web/src/components/systemdesign-workspace/diagram/sidebar/CodeDiagramPanel.tsx', 'utf8');

const startMatch = '  const handleGenerate = () => {';
const startIndex = content.indexOf(startMatch);

let openBraces = 0;
let endIndex = -1;
let started = false;

for (let i = startIndex; i < content.length; i++) {
  if (content[i] === '{') {
    openBraces++;
    started = true;
  } else if (content[i] === '}') {
    openBraces--;
  }

  if (started && openBraces === 0) {
    endIndex = i + 1;
    break;
  }
}

const functionContent = content.substring(startIndex, endIndex);

const generatorFile = `import { createShapeId, createBindingId, TLShapeId, Editor } from 'tldraw';
import dagre from '@dagrejs/dagre';
import { resolveDiagramAsset } from '@/utils/diagram-asset-matcher';

export const generateDiagramFromCode = async (
  code: string, 
  editor: Editor, 
  currentDirection: 'vertical' | 'horizontal', 
  spacing: number,
  setError: (err: string | null) => void
): Promise<void> => {
` + functionContent.replace(/  const handleGenerate = \(\) => \{/, '').slice(0, -1) + '};';

fs.writeFileSync('c:/Feroz/MainProjects/coding-arena/new/coding_arena/web/src/components/systemdesign-workspace/diagram/sidebar/utils/code-diagram-generator.ts', generatorFile);

const newContent = content.substring(0, startIndex) + 
`  const handleGenerate = async () => {
    if (!editor) {
      setError('Diagram editor is not ready yet.');
      return;
    }
    try {
      setError(null);
      await generateDiagramFromCode(code, editor, direction, spacing, setError);
    } catch (e: any) {
      setError(e.message || 'Failed to parse diagram syntax.');
    }
  };\n` + 
content.substring(endIndex);

// Add import
const importStr = `import { generateDiagramFromCode } from "./utils/code-diagram-generator";\n`;
const finalContent = newContent.replace('import { Button }', importStr + 'import { Button }');

fs.writeFileSync('c:/Feroz/MainProjects/coding-arena/new/coding_arena/web/src/components/systemdesign-workspace/diagram/sidebar/CodeDiagramPanel.tsx', finalContent);
console.log('Extraction complete');
