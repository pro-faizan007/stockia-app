import fs from 'fs';
import path from 'path';

const componentsDir = './src/components';
const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx'));
const indexCss = fs.readFileSync('./src/index.css', 'utf-8');

// Find all bg- classes in components
const allBgClasses = new Set();
for (const file of files) {
  const content = fs.readFileSync(path.join(componentsDir, file), 'utf-8');
  const bgs = content.match(/bg-[a-z0-9\/-]+/g) || [];
  bgs.forEach(b => allBgClasses.add(b));
}

console.log('Total unique bg- classes:', allBgClasses.size);

// Check which dark background classes are NOT overridden in .light-mode in index.css
const darkBgPatterns = [
  'bg-slate-950', 'bg-slate-900', 'bg-slate-850', 'bg-slate-800', 'bg-slate-750', 'bg-slate-700', 'bg-slate-650',
  'bg-emerald-950', 'bg-purple-950', 'bg-purple-900', 'bg-purple-800', 'bg-cyan-950', 'bg-black'
];

for (const bg of [...allBgClasses].sort()) {
  const isDark = darkBgPatterns.some(p => bg.startsWith(p));
  if (isDark) {
    // Check if indexCss has a rule for it
    // e.g. class*="bg-slate-900" or exact
    const hasClassSelector = indexCss.includes(`[class*="${bg}"]`) || 
                             indexCss.includes(`.${bg.replace('/', '\\/')}`) ||
                             indexCss.includes(`[class*="${bg.split('/')[0]}"]`);
    if (!hasClassSelector) {
      console.log('UNCOVERED DARK BG:', bg);
    }
  }
}
