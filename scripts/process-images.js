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

function processImages(inputDir, outputDir, textsToRemove = []) {
    if (!fs.existsSync(inputDir)) {
        console.log(`Input directory '${inputDir}' does not exist.`);
        return;
    }

    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff', '.webp'];
    let processedCount = 0;

    const files = fs.readdirSync(inputDir);

    files.forEach(filename => {
        const ext = path.extname(filename).toLowerCase();
        
        if (imageExtensions.includes(ext)) {
            let newFilename = filename;

            // Step 1: Remove unwanted text
            textsToRemove.forEach(textToRemove => {
                if (newFilename.includes(textToRemove)) {
                    newFilename = newFilename.replace(new RegExp(textToRemove, 'g'), '');
                }
            });

            // Step 2: Convert to kebab-case
            const nameWithoutExt = path.basename(newFilename, ext);
            const kebabName = convertToKebabCase(nameWithoutExt);
            newFilename = kebabName + ext;

            // Step 3: Copy file with new name
            const inputPath = path.join(inputDir, filename);
            const outputPath = path.join(outputDir, newFilename);

            try {
                fs.copyFileSync(inputPath, outputPath);
                console.log(`Processed: '${filename}' -> '${newFilename}'`);
                processedCount++;
            } catch (error) {
                console.error(`Error processing '${filename}': ${error.message}`);
            }
        }
    });

    console.log(`\nTotal images processed: ${processedCount}`);
    console.log(`Output directory: ${outputDir}`);
}

// Command line usage
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
        console.log('Usage: node process-images.js <input_dir> <output_dir> [text1] [text2] ...');
        console.log('Example: node process-images.js ./raw ./processed "-Photoroom" "-edited"');
        process.exit(1);
    }

    const inputDir = args[0];
    const outputDir = args[1];
    const textsToRemove = args.slice(2);
    
    console.log(`Processing images from '${inputDir}' to '${outputDir}'...`);
    if (textsToRemove.length > 0) {
        console.log(`Removing texts: ${textsToRemove.map(t => `'${t}'`).join(', ')}`);
    }
    
    processImages(inputDir, outputDir, textsToRemove);
}

module.exports = { processImages };