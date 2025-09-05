# Offline Model Setup for ezRAG

This guide explains how to set up the BGE-Small embedding model for completely offline usage.

## Quick Setup

1. **Download the model files:**
   ```bash
   npm run download-model
   ```

2. **Start the application:**
   ```bash
   npm start
   ```

The app will now work completely offline!

## What happens during setup

- Downloads the BGE-Small embedding model (~130MB) to `public/models/`
- Configures Transformers.js to use only local models
- Sets up proper error handling for offline scenarios

## File Structure After Setup

```
public/
├── models/
│   └── bge-small-en-v1.5/
│       ├── config.json
│       ├── tokenizer.json
│       ├── tokenizer_config.json
│       └── onnx/
│           └── model_quantized.onnx
└── ... other public files
```

## Offline Configuration Details

The embeddings are configured for offline use with:

- `env.allowLocalModels = true` - Enable local model loading
- `env.allowRemoteModels = false` - Disable remote downloads
- `local_files_only: true` - Force local-only mode
- Automatic fallback with helpful error messages

## Troubleshooting

If you get embedding errors:

1. Ensure you've run `npm run download-model`
2. Check that files exist in `public/models/bge-small-en-v1.5/`
3. Look at browser console for detailed error messages

## Model Details

- **Model**: BGE-Small-EN-v1.5
- **Size**: ~130MB (quantized)
- **Dimensions**: 384
- **Language**: English
- **Use Case**: Semantic text embeddings for RAG
