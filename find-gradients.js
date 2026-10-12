import fs from 'fs';
import path from 'path';

const componentsDir = './src/components';
const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const content = fs.readFileSync(path.join(componentsDir, file), 'utf-8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (line.includes('bg-gradient') || line.includes('from-') || line.includes('via-')) {
      if (line.includes('slate-') || line.includes('amber-') || line.includes('emerald-')) {
        console.log(`${file}:${idx + 1}: ${line.trim()}`);
      }
    }
  });
}
