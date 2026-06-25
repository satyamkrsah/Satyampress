const fs = require('fs');
const path = require('path');

const traverse = (dir) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverse(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;

      const replacements = [
        { regex: /bg-white(?!\s+dark:bg-background-dark|\s+dark:bg-surface-dark)/g, rep: 'bg-white dark:bg-background-dark transition-colors duration-300' },
        { regex: /bg-gray-50(?!\s+dark:bg-surface-dark)/g, rep: 'bg-gray-50 dark:bg-surface-dark transition-colors duration-300' },
        { regex: /text-primary(?!\s+dark:text-cream-dark|\s+dark:text-white)/g, rep: 'text-primary dark:text-cream-dark' },
        { regex: /border-gray-100(?!\s+dark:border-gray-800)/g, rep: 'border-gray-100 dark:border-gray-800 transition-colors duration-300' },
        { regex: /border-gray-200(?!\s+dark:border-gray-700)/g, rep: 'border-gray-200 dark:border-gray-700 transition-colors duration-300' }
      ];

      for (const { regex, rep } of replacements) {
        if (regex.test(content)) {
          content = content.replace(regex, rep);
          modified = true;
        }
      }

      if (modified) {
        // Clean up any double transition-colors duration-300 that might have been accidentally added
        content = content.replace(/(transition-colors duration-300\s*){2,}/g, 'transition-colors duration-300 ');
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Updated', fullPath);
      }
    }
  }
};

traverse('src/components');
traverse('src/pages');
