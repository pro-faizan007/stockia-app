import fs from 'fs';
import path from 'path';

const componentsDir = './src/components';
const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx'));
const indexCss = fs.readFileSync('./src/index.css', 'utf-8');

const allGradients = new Set();
for (const file of files) {
  const content = fs.readFileSync(path.join(componentsDir, file), 'utf-8');
  // Match things like bg-gradient-to-...
  const matches = content.match(/(bg-gradient-to-[a-z]+|from-[a-z0-9\/-]+|via-[a-z0-9\/-]+|to-[a-z0-9\/-]+)/g) || [];
  matches.forEach(m => allGradients.add(m));
}

console.log('Gradients elements:', [...allGradients].sort());
