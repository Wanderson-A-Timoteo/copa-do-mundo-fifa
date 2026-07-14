const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (file === 'page.tsx') {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (!content.includes('import PaginaAnimada')) {
        // Find the last import
        const lines = content.split('\n');
        let lastImportIndex = -1;
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].startsWith('import ')) {
            lastImportIndex = i;
          }
        }
        
        const importStatement = 'import PaginaAnimada from "@/components/PaginaAnimada";\n';
        if (lastImportIndex >= 0) {
          lines.splice(lastImportIndex + 1, 0, importStatement);
        } else {
          lines.unshift(importStatement);
        }
        
        content = lines.join('\n');
        
        // Find return ( ... );
        // We will just do a simple string replacement for the first return (
        // But since some components have early returns, we should find the default export
        const exportDefaultMatch = content.match(/export default (?:async )?function \w+\([^)]*\) \{/);
        if (exportDefaultMatch) {
          const startIndex = content.indexOf('return (', exportDefaultMatch.index);
          if (startIndex !== -1) {
            const beforeReturn = content.substring(0, startIndex + 8); // include "return ("
            const afterReturn = content.substring(startIndex + 8);
            content = beforeReturn + '\n    <PaginaAnimada>' + afterReturn;
            
            // Find the matching closing tag or just replace the last ); before the end of the function
            // A simple approach is to find the last ");" before the final "}"
            const lastClosingIndex = content.lastIndexOf(');');
            if (lastClosingIndex !== -1) {
              content = content.substring(0, lastClosingIndex) + '    </PaginaAnimada>\n  ' + content.substring(lastClosingIndex);
            }
          }
        }
        fs.writeFileSync(fullPath, content);
        console.log('Processed', fullPath);
      }
    }
  }
}

processDir('./src/app/(main)');
