const fs = require('fs');
const path = require('path');

function convertToKebabCase(str) {
    return str
        .toLowerCase()
        .replace(/[çÇ]/g, 'c')
        .replace(/[ğĞ]/g, 'g')
        .replace(/[ıİ]/g, 'i')
        .replace(/[öÖ]/g, 'o')
        .replace(/[şŞ]/g, 's')
        .replace(/[üÜ]/g, 'u')
        .replace(/[^a-z0-9\s\-\.]/g, '')  // Remove special chars except spaces, hyphens, dots
        .replace(/\s+/g, '-')             // Replace spaces with hyphens
        .replace(/-+/g, '-')              // Replace multiple hyphens with single
        .replace(/^-+|-+$/g, '');         // Remove leading/trailing hyphens
}

function renameToKebabCase(directory) {
    if (!fs.existsSync(directory)) {
        console.log(`Directory '${directory}' does not exist.`);
        return;
    }

    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff', '.webp'];
    let renamedCount = 0;

    const files = fs.readdirSync(directory);

    files.forEach(filename => {
        const ext = path.extname(filename).toLowerCase();
        const nameWithoutExt = path.basename(filename, ext);
        
        if (imageExtensions.includes(ext)) {
            const kebabName = convertToKebabCase(nameWithoutExt);
            const newFilename = kebabName + ext;

            if (filename !== newFilename) {
                const oldPath = path.join(directory, filename);
                const newPath = path.join(directory, newFilename);

                try {
                    fs.renameSync(oldPath, newPath);
                    console.log(`Renamed: '${filename}' -> '${newFilename}'`);
                    renamedCount++;
                } catch (error) {
                    console.error(`Error renaming '${filename}': ${error.message}`);
                }
            }
        }
    });

    console.log(`\nTotal files renamed: ${renamedCount}`);
}

// Command line usage
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length !== 1) {
        console.log('Usage: node rename-to-kebab.js <directory>');
        console.log('Example: node rename-to-kebab.js .');
        process.exit(1);
    }

    const directory = args[0];
    
    console.log(`Converting filenames to kebab-case in '${directory}'...`);
    renameToKebabCase(directory);
}

module.exports = { renameToKebabCase, convertToKebabCase };