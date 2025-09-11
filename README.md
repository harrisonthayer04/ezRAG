## ezRAG

A lightweight, client-first Retrieval-Augmented Generation (RAG) web app. Upload documents (.txt, .md, .pdf), build local embeddings in the browser, and query them via your chosen LLM (OpenRouter).

## Features
- Local, offline embeddings with `@xenova/transformers` (BGE Small)
- Client-side chunking and cosine similarity retrieval
- Classic RAG prompt assembly with citations
- PDF extraction (text-layer via PDF.js; OCR fallback via Tesseract)
- UI controls for top-k and similarity threshold
- In-memory vector store (React Context) with “clear all” support

## Architecture
- UI: React + TypeScript (Create React App)
- Embeddings: `@xenova/transformers` served from `public/models`
- Chunking: character-based with overlap
- Retrieval: cosine similarity over normalized vectors
- Model inference: OpenRouter (model `openai/gpt-5`)
- PDF extraction: `pdfjs-dist` (text-layer) + `tesseract.js` (OCR fallback)

Key files:
- `ez_rag/src/components/File_Upload.tsx`: ingestion, chunking, embedding
- `ez_rag/src/components/RAG_Tool.tsx`: retrieval, prompt assembly, LLM call
- `ez_rag/src/contexts/VectorContext.tsx`: in-memory vector store
- `ez_rag/src/lib/embeddings.ts`: embedder load and utilities
- `ez_rag/src/lib/chunk.ts`: chunking utilities
- `ez_rag/src/lib/pdf-extract.ts`: PDF text + OCR fallback
- `ez_rag/scripts/download-model.js`: embedding model downloader

## Getting Started

### Prerequisites
- Node 18+
- An OpenRouter API key

### Install
```bash
cd ez_rag
npm install
```

### Download the embedding model (offline)
```bash
npm run download-model
```
This places BGE Small files under `public/models/bge-small-en-v1.5`. The app loads models from `/models` and does not fetch remotely.

### Run
```bash
npm start
```

### Configure API key
- In the app, use the “Open Router API Key” field to save your key (stored in `localStorage`).
- The app uses `openai/gpt-5` via OpenRouter.

## Usage
1. Add your OpenRouter API key.
2. Upload `.txt`, `.md`, or `.pdf` files.
3. Ask questions in the RAG tool.
4. Optionally tune:
   - Top‑K retrieved chunks
   - Minimum similarity threshold
   - Toggle showing retrieved context

## How RAG Works Here
- Ingest: chunk documents (default 1800 chars, 200 overlap), embed locally with mean pooling + normalization.
- Store: vectors held in memory via React Context (optional future: persistence/ANN).
- Retrieve: embed question, compute cosine similarity, filter/sort, take top‑k.
- Augment: build a prompt with context snippets and simple citations.
- Generate: call OpenRouter and render the answer with optional context preview.

## PDF Extraction Notes
- Digital PDFs: extracted via PDF.js text layer.
- Scanned PDFs: per‑page OCR fallback using Tesseract.
- If you see PDF worker errors, ensure `pdf-extract.ts` points the worker correctly (local file or legacy build). See Troubleshooting.

## Troubleshooting
- OCR performance:
  - OCR is heavy; only triggered when a page lacks a text layer. Expect slower uploads for scanned PDFs.
- Model not loading:
  - Ensure `npm run download-model` completed and files exist under `public/models/bge-small-en-v1.5`.
- OpenRouter 401:
  - Verify the API key and that it is saved in the app. Check browser devtools for network errors.

## Security
- The API key is stored in `localStorage` and requests are made from the browser.

## Roadmap
- Model selector
- Chat-style interaction and conversation memory
- Adjustable chunking parameters
- Hybrid retrieval and re‑ranking
- New styling
