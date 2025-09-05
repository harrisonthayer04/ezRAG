#!/bin/bash

# BGE-Small model download script using curl
MODEL_NAME="bge-small-en-v1.5"
BASE_URL="https://huggingface.co/Xenova/bge-small-en-v1.5/resolve/main"
OUTPUT_DIR="$(dirname "$0")/../public/models/$MODEL_NAME"

# Create output directories
mkdir -p "$OUTPUT_DIR/onnx"

echo "Downloading BGE-Small embedding model to: $OUTPUT_DIR"

# Array of files to download
declare -a files=(
    "config.json"
    "tokenizer.json" 
    "tokenizer_config.json"
    "onnx/model_quantized.onnx"
)

# Download each file
for file in "${files[@]}"; do
    url="$BASE_URL/$file"
    output_path="$OUTPUT_DIR/$file"
    
    echo "Downloading: $url"
    
    if curl -L -o "$output_path" "$url" --fail --silent --show-error; then
        echo "✓ Downloaded: $(basename "$file")"
    else
        echo "❌ Failed to download: $file"
        exit 1
    fi
done

echo ""
echo "✅ Model download complete!"
echo "The model is now available for offline use."
