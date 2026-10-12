import fs from 'fs';
import path from 'path';

const componentsDir = './src/components';
const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx'));

console.log('--- Checking components for dark elements that might not convert in light mode ---');

for (const file of files) {
  const content = fs.readFileSync(path.join(componentsDir, file), 'utf-8');
  const lines = content.split('\n');
  lines.forEach((line, i) => {
    // Check for hardcoded bg-slate-900, bg-slate-950, bg-slate-800, etc. where text is light
    // But also check if it's inside an inline style or if it's an element that might not get overridden
    if (line.includes('bg-slate-750') || line.includes('bg-slate-650') || line.includes('bg-black/70') || line.includes('bg-purple-800')) {
      console.log(`[${file}:${i+1}] Uncovered dark class: ${line.trim()}`);
    }
  });
}
