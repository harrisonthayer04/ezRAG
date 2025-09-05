import { useMemo, useEffect, useState } from 'react';

export type StoredFileMetadata = {
  id: String;
  name: String;
  size: number;
  type: String;
  lastModified: number;
  text: String;
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
        lastModified: file.lastModified || Date.now()
        text: 
      }
      }
    }
    


  }
  
  return (
    <div>
      <input type="file" id="files" multiple />
      <button>Upload</button>
    </div>
  )
}

export default File_Upload