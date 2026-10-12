import fs from 'fs';
import path from 'path';

const componentsDir = './src/components';
const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx'));

console.log(`Checking ${files.length} components for styling and theme issues...`);

// Let's inspect index.css to see all selectors
const css = fs.readFileSync('./src/index.css', 'utf-8');

// Patterns that could cause "data text is missing in bg" (light text on light bg or dark on dark)
// or "bg is dark and text is light" mismatch
for (const file of files) {
  const content = fs.readFileSync(path.join(componentsDir, file), 'utf-8');
  
  // Check for text colors that might be low contrast on white in light mode:
  const lightColors = content.match(/text-(amber-[123]00|purple-[12]00|emerald-[12]00|blue-[12]00|yellow-[123]00|slate-[12]00)[a-z0-9\/]*/g) || [];
  if (lightColors.length > 0) {
    const unique = [...new Set(lightColors)];
    console.log(`[${file}] Light text colors used:`, unique);
  }

  // Check for hardcoded dark backgrounds or gradients
  const darkBgs = content.match(/bg-(slate-9[05]0|slate-8[05]0|black|emerald-950|purple-950|purple-900)[a-z0-9\/]*/g) || [];
  const gradients = content.match(/from-(slate-9[05]0|amber-[0-9]+\/[0-9]+)[a-z0-9\/]*/g) || [];
}
