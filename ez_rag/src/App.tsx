import React from 'react';
import logo from './logo.svg';
import './App.css';
import File_Upload from './components/File_Upload';
import Open_Router from './components/Open_Router';
import RAG_Tool from './components/RAG_Tool';
import { VectorProvider } from './contexts/VectorContext';

function App() {
  return (
    <VectorProvider>
      <div className="App">
        <h1>Welcome to ezRAG</h1>
        <h2>Begin by adding your Open Router API Key.</h2>
        <Open_Router />

        <h2>Then, upload your documents.</h2>
        <h3>You may upload TXT or MD files to build your knowledge base.</h3>
        <File_Upload />

        <h2>Once you have uploaded your documents, you can query them using the RAG tool below.</h2>
        <RAG_Tool />
      </div>
    </VectorProvider>
  );
}

export default App;
