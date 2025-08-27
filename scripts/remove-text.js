const fs = require('fs');
const path = require('path');

function removeTextFromFilenames(directory, textsToRemove) {
    if (!fs.existsSync(directory)) {
        console.log(`Directory '${directory}' does not exist.`);
        return;
    }

    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff', '.webp'];
    let renamedCount = 0;

    const files = fs.readdirSync(directory);

    files.forEach(filename => {
        const ext = path.extname(filename).toLowerCase();
        
        if (imageExtensions.includes(ext)) {
            let newFilename = filename;
            let hasChanged = false;

            // Remove each text from the array
            textsToRemove.forEach(textToRemove => {
                if (newFilename.includes(textToRemove)) {
                    newFilename = newFilename.replace(new RegExp(textToRemove, 'g'), '');
                    hasChanged = true;
                }
            });

            if (hasChanged) {
                // Clean up double spaces, hyphens, and trim
                newFilename = newFilename.replace(/\s+/g, ' ').replace(/-+/g, '-');
                newFilename = newFilename.replace(/^[\s-]+|[\s-]+$/g, '');
                
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
    
    if (args.length < 2) {
        console.log('Usage: node remove-text.js <directory> <text1> <text2> ... <textN>');
        console.log('Example: node remove-text.js . "-Photoroom" "-edited" "_copy"');
        process.exit(1);
    }

    const directory = args[0];
    const textsToRemove = args.slice(1);
    
    console.log(`Removing ${textsToRemove.map(t => `'${t}'`).join(', ')} from image filenames in '${directory}'...`);
    removeTextFromFilenames(directory, textsToRemove);
}

module.exports = { removeTextFromFilenames };