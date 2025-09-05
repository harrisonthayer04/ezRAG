import { useMemo, useEffect, useState } from 'react';
import { createStore, get, set, del, keys} from 'idb-keyval';
import { v4 as uuidv4 } from 'uuid';

const storage = createStore("rag-files", "files");

export type StoredFileMetadata = {
  id: String;
  name: String;
  size
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