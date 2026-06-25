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

  // Replace remaining grays
  content = content.replace(/\bbg-gray-300\b/g, 'bg-black/20');
  content = content.replace(/\bbg-gray-700\b/g, 'bg-white/20');
  content = content.replace(/\bbg-gray-800\b/g, 'bg-black/90');
  
  content = content.replace(/\bborder-gray-100\b/g, 'border-black/10');
  content = content.replace(/\bborder-gray-700\b/g, 'border-white/20');
  content = content.replace(/\bborder-gray-800\b/g, 'border-white/10');

  // Replace WhatsApp Green
  content = content.replace(/\bbg-green-500\b/g, 'bg-gold');
  content = content.replace(/\bhover:bg-green-600\b/g, 'hover:bg-gold-light');
  
  // Make WhatsApp icon text black to contrast with gold
  if (file.includes('WhatsAppFloatingButton.jsx')) {
    content = content.replace(/text-white/g, 'text-black');
  }

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
