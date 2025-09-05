import { useMemo, useEffect, useState } from 'react';

const storage = createStore("rag-files", "files");

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
  return (
    <div>
      <input type="file" id="files" multiple />
      <button>Upload</button>
    </div>
  )
}

export default File_Upload