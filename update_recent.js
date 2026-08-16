const fs = require('fs');
const path = require('path');

const obsidianDir = path.join(__dirname, 'obsidian');
const outputFile = path.join(obsidianDir, 'recent.json');

// Get all files recursively
function getAllFiles(dir, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;
    
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            getAllFiles(filePath, fileList);
        } else if (file.endsWith('.html')) {
            fileList.push({
                name: path.basename(file, '.html'),
                path: filePath.replace(__dirname + path.sep, '').replace(/\\/g, '/'), // Relative path with forward slashes
                modifiedTime: stat.mtimeMs,
                dateStr: stat.mtime.toISOString().split('T')[0]
            });
        }
    }
    return fileList;
}

console.log('Scanning obsidian folder for recent files...');
const allFiles = getAllFiles(obsidianDir);

// Sort by modified time (descending)
allFiles.sort((a, b) => b.modifiedTime - a.modifiedTime);

// Take top 5
const recentFiles = allFiles.slice(0, 5).map(f => ({
    name: f.name,
    path: f.path,
    date: f.dateStr
}));

fs.writeFileSync(outputFile, JSON.stringify(recentFiles, null, 2));
console.log(`Successfully written top ${recentFiles.length} recent files to obsidian/recent.json`);
