import { useMemo, useEffect, useState } from 'react';

export type StoredFileMetadata = {
  id: String;
  name: String;
  size: number;
  type: String;
  lastModified: number;
  text: String;
  error?: string;
};

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
        <button onClick={handleUpLoad} disabled={loading || !selected || selected.length === 0}>
          {}
        </button>
  )
} 

export default File_Upload