import React from 'react';
import logo from './logo.svg';
import './App.css';
import File_Upload from './components/File_Upload';
import Open_Router from './components/Open_Router';

function App() {
  return (
    <div className="App">
      <h1>Welcome to ezRAG</h1>
      <h2>Begin by adding your Open Router API Key.</h2>
      <Open_Router />

      <h2>Then, upload your documents.</h2>
      <h3>You may upload up to 10 documents, each must be a PDF, TXT, or MD file.</h3>

      <h2>Once you have uploaded your documents, you can query them using the RAG tool below.</h2>
      <File_Upload />
    </div>
  );
}

export default App;
