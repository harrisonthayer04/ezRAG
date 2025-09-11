import { useState } from 'react';

import { embedMany, loadEmbedder } from '../lib/embeddings';
import { chunkByChars } from '../lib/chunk';
import { useVectors } from '../contexts/VectorContext';
import { extractPdfText } from '../lib/pdf-extract';

export type StoredFileMetadata = {
  id: string;
  name: string;
  size: number;
  type: string;
  lastModified: number;
  text: string;
  error?: string;
};

// Remove local VectorRecord type - now using the one from context

function makeId(){
  return Date.now().toString(36) + Math.random().toString(36).slice(2,8);
}

async function readFileText(file: File): Promise<string> {
  const lower = file.name.toLowerCase();
  const isPdf = file.type === 'application/pdf' || lower.endsWith('.pdf');
  if (isPdf) {
    return extractPdfText(file);
  }
  return file.text();
}


const File_Upload: React.FC = () => {
  const { vectors, addVectors, clearVectors } = useVectors();
  const [selected, setSelected] = useState<FileList | null>(null);
  const [items, setItems] = useState<StoredFileMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload() {
    if (!selected || selected.length === 0) return;
    setLoading(true);
    setError(null);

    try {
      const next: StoredFileMetadata[] = [];

      for (const file of Array.from(selected)) {
        const base = {
          id: makeId(),
          name: file.name,
          size: file.size,
          type: file.type || 'text/plain',
          lastModified: file.lastModified || Date.now(),
        };

        try {
          const lower = file.name.toLowerCase();
          const isTxtOrMd =
            file.type.startsWith('text/') || lower.endsWith('.txt') || lower.endsWith('.md');
          const isPdf = file.type === 'application/pdf' || lower.endsWith('.pdf');

          if (!isTxtOrMd && !isPdf) {
            next.push({ ...base, text: '', error: 'Only .pdf, .txt, and .md files are supported.' });
            continue;
          }

          const text = await readFileText(file);
          next.push({ ...base, text });
        } catch (e: any) {
          next.push({ ...base, text: '', error: e?.message || String(e) });
        }
      }

      setItems(next);

      // ----- Build embeddings locally -----
      // Ensure the model is loaded (first call downloads weights, then cached).
      await loadEmbedder();

      // Chunk each successful file and collect all chunks
      const chunks: { fileId: string; chunkIndex: number; text: string }[] = [];
      for (const it of next) {
        if (it.error) continue;
        const parts = chunkByChars(it.text, 1800, 200); // tune sizes as you like
        parts.forEach((t, i) => {
          chunks.push({ fileId: it.id, chunkIndex: i, text: t });
        });
      }

      // Compute embeddings for all chunks
      const embs = await embedMany(chunks.map((c) => c.text));

      // Pair back results and add to global vector store
      const recs = embs.map((e, i) => ({
        fileId: chunks[i].fileId,
        fileName: next.find(f => f.id === chunks[i].fileId)?.name || 'Unknown',
        chunkIndex: chunks[i].chunkIndex,
        text: chunks[i].text,
        vector: e, // Keep as Float32Array for similarity calculations
      }));

      addVectors(recs);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ margin: '20px 0', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h3>Document Upload</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <input
          type="file"
          id="files"
          multiple
          accept=".txt,.md,.pdf,text/plain,text/markdown,application/pdf"
          onChange={(e) => setSelected(e.target.files)}
          style={{ marginBottom: '10px' }}
        />
        <div>
          <button 
            onClick={handleUpload} 
            disabled={loading || !selected || selected.length === 0}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: loading ? '#ccc' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginRight: '10px'
            }}
          >
            {loading ? 'Processing…' : 'Upload & Process'}
          </button>
          {vectors.length > 0 && (
            <button 
              onClick={clearVectors}
              style={{
                padding: '10px 20px',
                fontSize: '16px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Clear All Documents
            </button>
          )}
        </div>
      </div>

      {error && (
        <div style={{ background: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '4px', marginBottom: '15px' }}>
          Error: {error}
        </div>
      )}

      {/* Current vector store status */}
      {vectors.length > 0 && (
        <div style={{ background: '#d4edda', color: '#155724', padding: '10px', borderRadius: '4px', marginBottom: '15px' }}>
          <strong>{vectors.length} chunks</strong> from <strong>{new Set(vectors.map(v => v.fileName)).size} file(s)</strong> ready for RAG queries
        </div>
      )}

      {/* File metadata (simplified) */}
      {items.length > 0 && (
        <div>
          <h4>Recently Uploaded Files:</h4>
          {items.map((it) => (
            <div key={it.id} style={{ margin: '10px 0', padding: '10px', background: '#f8f9fa', borderRadius: '4px' }}>
              <div style={{ fontWeight: 'bold' }}>{it.name}</div>
              <div style={{ fontSize: '0.9em', color: '#666' }}>
                Size: {(it.size / 1024).toFixed(1)} KB • 
                Type: {it.type || 'unknown'} • 
                Chunks: {vectors.filter(v => v.fileId === it.id).length}
              </div>
              {it.error && (
                <div style={{ color: '#dc3545', marginTop: '5px' }}>Error: {it.error}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default File_Upload