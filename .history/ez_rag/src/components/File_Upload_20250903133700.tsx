import { useMemo, useEffect, useState } from 'react'
import { createStore, get, set, del, keys} from 'id'

const File_Upload: React.FC = () => {
  return (
    <div>
      <input type="file" id="files" multiple />
      <button>Upload</button>
    </div>
  )
}

export default File_Upload