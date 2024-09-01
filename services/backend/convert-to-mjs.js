const fs = require('fs');
const path = require('path');

function convertMjsToJs(dir) {
    // Read all files and subdirectories in the current directory
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        
        // Check if it's a directory, and if so, recurse into it
        if (fs.statSync(fullPath).isDirectory()) {
            convertMjsToJs(fullPath);
        } else if (path.extname(fullPath) === '.mjs') {
            // If the file has a .mjs extension, rename it to .js
            const newFullPath = fullPath.replace(/\.mjs$/, '.js');
            fs.renameSync(fullPath, newFullPath);
            console.log(`Renamed: ${fullPath} -> ${newFullPath}`);
        }
    });
}

// Start the conversion from the current directory or specify a specific directory
convertMjsToJs(__dirname);