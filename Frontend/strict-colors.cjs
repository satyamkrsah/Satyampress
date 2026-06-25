const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fileDir = path.join(dir, file);
    const stat = fs.statSync(fileDir);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fileDir));
    } else if (fileDir.endsWith('.jsx') || fileDir.endsWith('.js')) {
      results.push(fileDir);
    }
  });
  return results;
}

const files = walk('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Backgrounds
  content = content.replace(/\bbg-gray-[0-9]+\b/g, 'bg-white dark:bg-black');
  
  // Text
  content = content.replace(/\btext-gray-[0-9]+\b/g, 'text-black dark:text-white');
  
  // Borders
  content = content.replace(/\bborder-gray-[0-9]+\b/g, 'border-black dark:border-white');

  // Opacities
  content = content.replace(/\btext-white\/[0-9]+\b/g, 'text-white');
  content = content.replace(/\btext-black\/[0-9]+\b/g, 'text-black');
  content = content.replace(/\bbg-black\/[0-9]+\b/g, 'bg-black');
  content = content.replace(/\bbg-white\/[0-9]+\b/g, 'bg-white');
  content = content.replace(/\bbg-primary\/[0-9]+\b/g, 'bg-primary');

  // Fix potential duplication like "dark:bg-black dark:bg-surface-dark"
  // Since we replaced blindly, let's clean up some obvious duplicates
  content = content.replace(/bg-white\s+dark:bg-black\s+dark:bg-surface-dark/g, 'bg-white dark:bg-black');
  content = content.replace(/text-black\s+dark:text-white\s+dark:text-gray-400/g, 'text-black dark:text-white');
  content = content.replace(/border-black\s+dark:border-white\s+dark:border-gray-800/g, 'border-black dark:border-white');
  content = content.replace(/border-black\s+dark:border-white\s+dark:border-gray-700/g, 'border-black dark:border-white');
  content = content.replace(/text-black\s+dark:text-white\s+dark:text-gray-300/g, 'text-black dark:text-white');
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
