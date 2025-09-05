import { useState } from 'react';

import { embedMany, loadEmbedder } from '../lib/embeddings';
import { chunkByChars } from '../lib/chunk';

export type StoredFileMetadata = {
  id: string;
  name: string;
  size: number;
  type: string;
  lastModified: number;
  text: string;
  error?: string;
};

type vectorRecord = {
  fileId: string;
  chunkIndex: number;
  text: string;
  vector: number[];
}

function makeId(){
  return Date.now().toString(36) + Math.random().toString(36).slice(2,8);
}

const File_Upload: React.FC = () => {

  const [selected, setSelected] = useState<FileList | null>(null);
  const [items, setItems] = useState<StoredFileMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(){
    if (!selected || selected.length === 0){ return; }
    setLoading(true);
    setError(null);

    const next: StoredFileMetadata[] = [];

    for (const file of Array.from(selected)){
      const base = {
        id: makeId(),
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified || Date.now(),
      };
      try {
        const nameLower = file.name.toLowerCase();
        const isTxtOrMd =
          file.type.startsWith("text/") || nameLower.endsWith(".txt") || nameLower.endsWith(".md");

        if (!isTxtOrMd) { // Reject anything not .txt/.md
          next.push({ ...base, text: "", error: "Only .txt and .md files are supported." });
          continue;
        }

        const text = await file.text(); // Read text directly from the File object
        next.push({ ...base, text }); // On success, push metadata + text
      } catch (e: any) { // If reading fails for this file
        next.push({ ...base, text: "", error: e?.message || String(e) }); // Push metadata with error message
      }
    }

    setItems(next); // Commit all prepared preview items to component state
    
      // ----- Build embeddings locally -----
      // Ensure the model is loaded (first call downloads weights, then cached).
      await loadEmbedder();

      // Chunk each successful file and collect all chunks
      const chunks: { fileId: string; chunkIndex: number; text: string }[] = [];
      for (const it of next) {
        if (it.error) continue;
        const parts = chunkByChars(it.text, 1200, 150); // tune sizes as you like
        parts.forEach((t, i) => {
          chunks.push({ fileId: it.id, chunkIndex: i, text: t });
        });
      }

      // Compute embeddings for all chunks
      const embs = await embedMany(chunks.map((c) => c.text));

      // Pair back results for display
      const recs: VectorRecord[] = embs.map((e, i) => ({
        ...chunks[i],
        vector: Array.from(e), // convert Float32Array -> number[] so we can stringify/display
      }));

      setVectors(recs);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

    
    
    
    
    
    
    
    
    
    
    
    
    
    setLoading(false); // Turn off loading state
  

  }
  
  return (
    <div>
      <div>
        <input 
          type="file"
          id="files"
          multiple
          accept=".txt,.md,text/plain,text/markdown"
          onChange= {(e) => setSelected(e.target.files)}
          />
        <button onClick={handleUpload} disabled={loading || !selected || selected.length === 0}>
          {loading ? "Uploading..." : "Upload"}
        </button>
        </div>

        {error && <p>{error}</p>}
        <div>
        {items.map((it) => (
          <div key={it.id}>
            <div><strong>{it.name}</strong></div>
            <div>Size: {(it.size / 1024).toFixed(1)} KB</div>
            <div>Type: {it.type || "unknown"}</div>
            <div>Last Modified: {new Date(it.lastModified).toLocaleString()}</div>
            {it.error ? (
              <div>Error: {it.error}</div>
            ) : (
              <pre style={{ whiteSpace: "pre-wrap" }}>{it.text}</pre>
            )}
            <hr />
          </div>
        ))}
      </div>
        </div>
  )
} 

export default File_Upload