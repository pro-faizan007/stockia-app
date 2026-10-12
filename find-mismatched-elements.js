import fs from 'fs';
import path from 'path';

const componentsDir = './src/components';
const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx'));

console.log('Searching for buttons/badges with hardcoded dark backgrounds or light text...');

for (const file of files) {
  const content = fs.readFileSync(path.join(componentsDir, file), 'utf-8');
  const lines = content.split('\n');
  lines.forEach((line, i) => {
    // Check buttons, badges, spans with dark backgrounds or light text
    if ((line.includes('<button') || line.includes('<span') || line.includes('<div')) &&
        (line.includes('bg-purple-9') || line.includes('bg-purple-8') || line.includes('bg-emerald-9') || line.includes('bg-cyan-9') || line.includes('bg-slate-950') || line.includes('bg-slate-900') || line.includes('bg-slate-800') || line.includes('bg-slate-700'))) {
      if (line.includes('text-purple-200') || line.includes('text-amber-200') || line.includes('text-amber-300') || line.includes('text-emerald-300') || line.includes('text-purple-300') || line.includes('text-slate-300') || line.includes('text-slate-400')) {
        console.log(`[${file}:${i+1}] ${line.trim()}`);
      }
    }
  });
}
