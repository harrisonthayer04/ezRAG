#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

const MODEL_NAME = 'bge-small-en-v1.5';
const MODEL_FILES = [
    'config.json',
    'tokenizer.json',
    'tokenizer_config.json',
    'onnx/model_quantized.onnx'
];

const BASE_URL = 'https://huggingface.co/Xenova/bge-small-en-v1.5/resolve/main/';
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'models', MODEL_NAME);

// Create output directory
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Create onnx subdirectory
const onnxDir = path.join(OUTPUT_DIR, 'onnx');
if (!fs.existsSync(onnxDir)) {
    fs.mkdirSync(onnxDir, { recursive: true });
}

function downloadFile(url, outputPath) {
    return new Promise((resolve, reject) => {
        console.log(`Downloading: ${url}`);
        const file = fs.createWriteStream(outputPath);
        
        https.get(url, (response) => {
            if (response.statusCode === 302 || response.statusCode === 301) {
                // Handle redirect
                return downloadFile(response.headers.location, outputPath)
                    .then(resolve)
                    .catch(reject);
            }
            
            if (response.statusCode !== 200) {
                reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
                return;
            }
            
            response.pipe(file);
            
            file.on('finish', () => {
                file.close();
                console.log(`✓ Downloaded: ${path.basename(outputPath)}`);
                resolve();
            });
            
            file.on('error', (err) => {
                fs.unlink(outputPath, () => {}); // Delete partial file
                reject(err);
            });
        }).on('error', reject);
    });
}

async function downloadModel() {
    console.log(`Downloading BGE-Small embedding model to: ${OUTPUT_DIR}`);
    
    try {
        for (const file of MODEL_FILES) {
            const url = BASE_URL + file;
            const outputPath = path.join(OUTPUT_DIR, file);
            await downloadFile(url, outputPath);
        }
        
        console.log('\n✅ Model download complete!');
        console.log('The model is now available for offline use.');
        
    } catch (error) {
        console.error('\n❌ Download failed:', error.message);
        process.exit(1);
    }
}

downloadModel();
