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

function downloadFile(url, outputPath, redirectCount = 0) {
    return new Promise((resolve, reject) => {
        if (redirectCount > 5) {
            reject(new Error('Too many redirects'));
            return;
        }
        
        console.log(`Downloading: ${url}`);
        const file = fs.createWriteStream(outputPath);
        
        const request = https.get(url, { 
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; model-downloader/1.0)'
            }
        }, (response) => {
            if (response.statusCode === 302 || response.statusCode === 301 || response.statusCode === 307) {
                file.destroy();
                fs.unlink(outputPath, () => {});
                // Handle redirect
                const redirectUrl = response.headers.location;
                console.log(`Following redirect to: ${redirectUrl}`);
                return downloadFile(redirectUrl, outputPath, redirectCount + 1)
                    .then(resolve)
                    .catch(reject);
            }
            
            if (response.statusCode !== 200) {
                file.destroy();
                fs.unlink(outputPath, () => {});
                reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage} for ${url}`));
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
        });
        
        request.on('error', (err) => {
            file.destroy();
            fs.unlink(outputPath, () => {});
            reject(err);
        });
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
