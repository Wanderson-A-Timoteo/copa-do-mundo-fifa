/* eslint-disable */
const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.css')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // bg-white -> bg-zinc-100
    content = content.replace(/bg-white\b/g, 'bg-zinc-100');
    // text-white -> text-zinc-50
    content = content.replace(/text-white\b/g, 'text-zinc-50');
    // border-white -> border-zinc-100
    content = content.replace(/border-white\b/g, 'border-zinc-100');
    
    // bg-black -> bg-zinc-900
    content = content.replace(/bg-black\b/g, 'bg-zinc-900');
    // text-black -> text-zinc-900
    content = content.replace(/text-black\b/g, 'text-zinc-900');
    
    // zinc-950 -> zinc-800 (for cards/footer when body is 900)
    // Wait, let's be careful. Let's just replace zinc-950 with zinc-800 everywhere it appears as a class.
    content = content.replace(/zinc-950\b/g, 'zinc-800');

    // Replace #FFFFFF with #fafafa
    content = content.replace(/#FFFFFF/gi, '#fafafa');
    // Replace #000000 with #18181b
    content = content.replace(/#000000/gi, '#18181b');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated: ' + filePath);
    }
  }
});
