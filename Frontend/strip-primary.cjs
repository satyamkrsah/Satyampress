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
    } else if (fileDir.endsWith('.jsx') || fileDir.endsWith('.js') || fileDir.endsWith('.css')) {
      results.push(fileDir);
    }
  });
  return results;
}

const files = walk('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace primary references with black to bypass any CSS cache issues
  content = content.replace(/\bbg-primary-light\b/g, 'bg-gray-800');
  content = content.replace(/\bbg-primary\b/g, 'bg-black');
  
  content = content.replace(/\btext-primary-light\b/g, 'text-gray-800');
  content = content.replace(/\btext-primary\b/g, 'text-black');
  
  content = content.replace(/\bborder-primary\b/g, 'border-black');
  content = content.replace(/\bring-primary\b/g, 'ring-black');
  
  content = content.replace(/\bfrom-primary\b/g, 'from-black');
  content = content.replace(/\bvia-primary\b/g, 'via-black');
  content = content.replace(/\bto-primary\b/g, 'to-black');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
