import React from 'react'
import { useState } from 'react';



const Open_Router = () => {
  const [apiKey, setApiKey] = useState('');
  const [showSavedMessage, setShowSavedMessage] = useState(false);

  const handleSave = () => {
    localStorage.setItem('openRouterApiKey', apiKey);
    setShowSavedMessage(true);
    // Hide the message after 3 seconds
    setTimeout(() => {
      setShowSavedMessage(false);
    }, 3000);
  }

  return (
    <div>
    <label htmlFor="Open Router API Key">Open Router API Key: 
    <input type="text" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
    </label>
    <button onClick={handleSave}>Save</button>
    {showSavedMessage && <p>API Key saved</p>}
    </div>
  )

}

export default Open_Router