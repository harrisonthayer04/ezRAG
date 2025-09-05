import React from 'react'
import { useState } from 'react';



const Open_Router = () => {
  const [apiKey, setApiKey] = useState('');
  const [state, setState] = useState('idle');

  const handleSave = () => {
    localStorage.setItem('openRouterApiKey', apiKey);
    return (<div>
        <p>API Key saved</p>
        <button onClick={() => setState('idle')}>Close</button>
    </div>)
  }

  return (
    <div>
    <label htmlFor="Open Router API Key">Open Router API Key: 
    <input type="text" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
    </label>
    <button onClick={handleSave}>Save</button>
    </div>
  )

}

export default Open_Router