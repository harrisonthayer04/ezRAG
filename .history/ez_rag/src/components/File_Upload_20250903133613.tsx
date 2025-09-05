import { useMemo, useEffect, useState } from 'react'

const File_Upload: React.FC = () => {
  return (
    <div>
      <input type="file" id="files" multiple />
      <button>Upload</button>
    </div>
  )
}

export default File_Upload