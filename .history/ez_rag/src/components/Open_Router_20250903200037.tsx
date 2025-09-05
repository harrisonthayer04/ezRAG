import React from 'react'
import { useState } from 'react';

const [apiKey, setApiKey] = useState('');

const Open_Router = () => {
  return (
    <div>
    <label htmlFor="Open Router API Key">Open Router API Key: 
    <input type="text" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
    </label>
    <button>Save</button>
    </div>
  )

}

export default Open_Router