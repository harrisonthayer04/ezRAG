import React from 'react'
import { useState } from 'react';



const Open_Router = () => {
  const [apiKey, setApiKey] = useState('');
  const [state, setState] = useState('idle');

  const handleSave = () => {
    localStorage.setItem('openRouterApiKey', apiKey);
    setState('saved');
  }

  return (
    <div>
    <label htmlFor="Open Router API Key">Open Router API Key: 
    <input type="text" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
    </label>
    <button onClick={handleSave}>Save</button>
    {state === 'saved' && <p>API Key saved successfully</p>}
    </div>  
  )

}

export default Open_Router