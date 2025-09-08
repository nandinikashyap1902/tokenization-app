import React, { useState, useMemo } from 'react';

const EmbeddingsSection = () => {
  const [inputText, setInputText] = useState('');
  const [embedding, setEmbedding] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Memoize API configuration to prevent recreation on every render
  const apiConfig = useMemo(() => ({
    endpoint: process.env.NODE_ENV === 'development' 
      ? 'http://localhost:4000/api/embeddings'
      : '/api/embeddings'
  }), []);


  const generateEmbedding = async () => {
    setLoading(true);
    setError('');
    setEmbedding(null); // Clear previous embedding
    
    console.log('🔍 Generating embedding for text:', inputText);
    console.log('🤖 Using API endpoint:', apiConfig.endpoint);
    
    try {
      const requestBody = { input: inputText };
      console.log('📤 Request body:', requestBody);
      console.log('🤖 Using OpenAI embeddings');

      // Test server connection first in development
      if (process.env.NODE_ENV === 'development') {
        try {
          const healthCheck = await fetch('http://localhost:4000/health', { method: 'GET' });
          if (!healthCheck.ok) {
            throw new Error('Server not responding');
          }
        } catch (healthErr) {
          setError('🔌 Backend server not running. Please start the server with "npm run dev"');
          setLoading(false);
          return;
        }
      }

      // Generate embedding using API
      const response = await fetch(`${apiConfig.endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.error || `API error: ${response.status} ${response.statusText}`;
        
        console.error('❌ API Response Error:', response.status, errorMessage);
        
        // Handle specific error cases
        if (response.status === 401) {
          setError('🔑 Invalid API key. Please check your OpenAI API key in the .env file.');
        } else if (response.status === 500 && errorMessage.includes('Missing OPENAI_API_KEY')) {
          setError('🔑 Missing API key. Please add OPENAI_API_KEY to your .env file.');
        } else {
          setError(`❌ ${errorMessage}`);
        }
        setLoading(false);
        return;
      }

      const result = await response.json();
      console.log('📥 API Response:', result);
      
      // Format result to match expected structure
      setEmbedding({
        embedding: result.embedding,
        model: result.model,
        provider: result.provider,
        index: 0,
        object: 'embedding'
      });

    } catch (err) {
      console.error('Error creating embedding:', err);
      
      if (err.message.includes('Failed to fetch') || err.message.includes('connection')) {
        setError('🔌 Connection failed. Check if the server is running and try again.');
      } else {
        setError(`❌ Error: ${err.message || 'Failed to generate embedding'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatEmbedding = (embeddingArray) => {
    return embeddingArray.slice(0, 10).map(val => val.toFixed(6)).join(', ') + '...';
  };

  return (
    <div className="embeddings-section">
      <div className="section-header">
        <h2>🧠 Embeddings</h2>
        <p>Generate vector embeddings for text using OpenAI's text-embedding-3-small model</p>
      </div>

      <div className="embeddings-container">
        <div className="input-section">
          <h3>📄 Input Text</h3>
          <div className="model-info">
            <span className="model-label">🤖 Embedding Model:</span>
            <span className="model-name">OpenAI text-embedding-3-small (1536 dimensions)</span>
          </div>
          <div className="input-group">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter text to generate embeddings..."
              className="text-input"
              rows={4}
            />
            <button 
              onClick={generateEmbedding} 
              className="generate-btn"
              disabled={loading || !inputText.trim()}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Generating...
                </>
              ) : (
                '🚀 Generate Embedding'
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="error-box">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {embedding && (
          <div className="results-section">
            <div className="embedding-stats">
              <div className="stat-card">
                <h4>📊 Embedding Stats</h4>
                <div className="stats-grid">
                  <div className="stat">
                    <span className="stat-label">Dimensions:</span>
                    <span className="stat-value">{embedding.embedding.length}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Model:</span>
                    <span className="stat-value">{embedding.model || 'text-embedding-3-small'}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Input Length:</span>
                    <span className="stat-value">{inputText.length} chars</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="embedding-preview">
              <div className="result-header">
                <h4>🔍 Embedding Preview (first 10 values)</h4>
                <button 
                  onClick={() => copyToClipboard(JSON.stringify(embedding.embedding))}
                  className="copy-btn"
                >
                  {copied ? '✅' : '📋'} Copy Full Vector
                </button>
              </div>
              <div className="embedding-values">
                <code>{formatEmbedding(embedding.embedding)}</code>
              </div>
            </div>

            <div className="embedding-visualization">
              <h4>📈 Vector Visualization</h4>
              <div className="vector-bars">
                {embedding.embedding.slice(0, 50).map((value, index) => (
                  <div 
                    key={index} 
                    className="vector-bar"
                    style={{
                      height: `${Math.abs(value) * 100}px`,
                      backgroundColor: value >= 0 ? '#4CAF50' : '#FF5722'
                    }}
                    title={`Index ${index}: ${value.toFixed(6)}`}
                  ></div>
                ))}
              </div>
              <p className="viz-note">Showing first 50 dimensions (green: positive, red: negative)</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmbeddingsSection;