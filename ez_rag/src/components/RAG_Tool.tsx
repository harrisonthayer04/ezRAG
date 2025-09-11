import React from 'react'
import { useState } from 'react';
import OpenAI from 'openai';
import { embedOne, cosineSimilarity, loadEmbedder } from '../lib/embeddings';
import { useVectors, VectorRecord } from '../contexts/VectorContext';

const apiKey = localStorage.getItem('openRouterApiKey');
if (!apiKey) {
    throw new Error('OpenRouter API key not found');
}

const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: apiKey,
    dangerouslyAllowBrowser: true
});

type RetrievalResult = {
  chunk: VectorRecord;
  similarity: number;
};

async function retrieveRelevantChunks(
  question: string, 
  vectors: VectorRecord[], 
  topK: number = 5, 
  minSimilarity: number = 0.3
): Promise<RetrievalResult[]> {
  if (vectors.length === 0) {
    return [];
  }

  // Embed the question
  const questionEmbedding = await embedOne(question);
  
  // Calculate similarities and sort
  const similarities: RetrievalResult[] = vectors.map(chunk => ({
    chunk,
    similarity: cosineSimilarity(questionEmbedding, chunk.vector)
  }));
  
  // Filter by minimum similarity and take top-k
  return similarities
    .filter(result => result.similarity >= minSimilarity)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
}

function buildRAGPrompt(question: string, retrievedChunks: RetrievalResult[]): string {
  if (retrievedChunks.length === 0) {
    return `I don't have any relevant information in my knowledge base to answer your question: "${question}". Please upload some documents first, or try rephrasing your question.`;
  }

  const contextSection = retrievedChunks
    .map((result, index) => 
      `[${index + 1}] From "${result.chunk.fileName}" (chunk ${result.chunk.chunkIndex}, similarity: ${result.similarity.toFixed(3)}):\n${result.chunk.text}`
    )
    .join('\n\n');

  return `Based on the following context from uploaded documents, please answer the question. If the context doesn't contain enough information to answer the question, please say so.

CONTEXT:
${contextSection}

QUESTION: ${question}

Please provide a helpful answer based on the context above. If you reference information from the context, please cite the source using the format [1], [2], etc.`;
}

async function ask(question: string, vectors: VectorRecord[], topK: number = 5, minSimilarity: number = 0.3) {
    await loadEmbedder();
    
    // Retrieve relevant chunks
    const retrievedChunks = await retrieveRelevantChunks(question, vectors, topK, minSimilarity);
    
    // Build the RAG prompt
    const prompt = buildRAGPrompt(question, retrievedChunks);
    
    // If no relevant chunks found, return early message
    if (retrievedChunks.length === 0) {
        return {
            answer: prompt,
            retrievedChunks: []
        };
    }
    
    const completion = await openai.chat.completions.create({
        model: 'openai/gpt-5',
        messages: [{
            role: 'system',
            content: 'You are a helpful assistant that answers questions based on provided context. Always cite your sources when referencing information from the context.'
        }, {
            role: 'user',
            content: prompt
        }],
        temperature: 0.1
    });
    
    return {
        answer: completion.choices[0].message.content || 'No response generated.',
        retrievedChunks
    };
};


const RAG_Tool = () => {
    const { vectors } = useVectors();
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [retrievedChunks, setRetrievedChunks] = useState<RetrievalResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [topK, setTopK] = useState(5);
    const [minSimilarity, setMinSimilarity] = useState(0.3);
    const [showContext, setShowContext] = useState(false);
    
    const handleAsk = async () => {
        if (!question.trim()) return;
        
        setLoading(true);
        setAnswer('');
        setRetrievedChunks([]);
        
        try {
            const result = await ask(question, vectors, topK, minSimilarity);
            setAnswer(result.answer);
            setRetrievedChunks(result.retrievedChunks);
        } catch (error) {
            console.error('Error asking question:', error);
            setAnswer('Sorry, there was an error processing your question. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !loading) {
            handleAsk();
        }
    }

    return (
        <div style={{ margin: '20px 0', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h3>RAG Query Tool</h3>
            
            {vectors.length === 0 && (
                <div style={{ background: '#fff3cd', padding: '10px', borderRadius: '4px', marginBottom: '15px' }}>
                     No documents uploaded yet. Please upload some documents first to enable RAG queries.
                </div>
            )}
            
            <div style={{ marginBottom: '15px' }}>
                <strong>Documents loaded: {vectors.length} chunks</strong>
                {vectors.length > 0 && (
                    <span style={{ marginLeft: '10px', fontSize: '0.9em', color: '#666' }}>
                        from {new Set(vectors.map(v => v.fileName)).size} file(s)
                    </span>
                )}
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', flexWrap: 'wrap' }}>
                <label>
                    Top-K results: 
                    <input 
                        type="number" 
                        min="1" 
                        max="20" 
                        value={topK} 
                        onChange={(e) => setTopK(parseInt(e.target.value) || 5)}
                        style={{ width: '60px', marginLeft: '5px' }}
                    />
                </label>
                <label>
                    Min similarity: 
                    <input 
                        type="number" 
                        min="0" 
                        max="1" 
                        step="0.1" 
                        value={minSimilarity} 
                        onChange={(e) => setMinSimilarity(parseFloat(e.target.value) || 0.3)}
                        style={{ width: '60px', marginLeft: '5px' }}
                    />
                </label>
                <label>
                    <input 
                        type="checkbox" 
                        checked={showContext} 
                        onChange={(e) => setShowContext(e.target.checked)}
                    />
                    Show retrieved context
                </label>
            </div>

            {/* Question input */}
            <div style={{ marginBottom: '15px' }}>
                <label htmlFor="question" style={{ display: 'block', marginBottom: '5px' }}>
                    <strong>Ask a question about your documents:</strong>
                </label>
                <input 
                    type="text" 
                    id="question" 
                    value={question} 
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="e.g., What is the main topic discussed in the documents?"
                    style={{ 
                        width: '100%', 
                        padding: '10px', 
                        fontSize: '16px',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                    }}
                    disabled={loading}
                />
                <button 
                    onClick={handleAsk} 
                    disabled={loading || !question.trim() || vectors.length === 0}
                    style={{
                        marginTop: '10px',
                        padding: '10px 20px',
                        fontSize: '16px',
                        backgroundColor: loading ? '#ccc' : '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading ? 'Processing...' : 'Ask'}
                </button>
            </div>

            {/* Answer */}
            {answer && (
                <div style={{ marginTop: '20px' }}>
                    <h4>Answer:</h4>
                    <div style={{ 
                        background: '#f8f9fa', 
                        padding: '15px', 
                        borderRadius: '4px',
                        whiteSpace: 'pre-wrap',
                        border: '1px solid #e9ecef'
                    }}>
                        {answer}
                    </div>
                </div>
            )}

            {/* Retrieved context */}
            {showContext && retrievedChunks.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                    <h4>Retrieved Context ({retrievedChunks.length} chunks):</h4>
                    {retrievedChunks.map((result, index) => (
                        <div key={`${result.chunk.fileId}-${result.chunk.chunkIndex}`} 
                             style={{ 
                                 margin: '10px 0', 
                                 padding: '10px', 
                                 background: '#f1f3f4', 
                                 borderRadius: '4px',
                                 border: '1px solid #dadce0'
                             }}>
                            <div style={{ fontSize: '0.9em', color: '#666', marginBottom: '5px' }}>
                                <strong>[{index + 1}]</strong> {result.chunk.fileName} 
                                (chunk {result.chunk.chunkIndex}, similarity: {result.similarity.toFixed(3)})
                            </div>
                            <div style={{ fontSize: '0.95em', whiteSpace: 'pre-wrap' }}>
                                {result.chunk.text.length > 300 
                                    ? result.chunk.text.slice(0, 300) + '...' 
                                    : result.chunk.text
                                }
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default RAG_Tool