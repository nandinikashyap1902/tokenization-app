const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Embeddings endpoint - uses OpenAI exclusively
app.post('/api/embeddings', async (req, res) => {
  try {
    const { input } = req.body || {};
    if (!input || typeof input !== 'string' || !input.trim()) {
      return res.status(400).json({ error: 'Invalid input: expected non-empty string' });
    }

    // Use OpenAI embeddings exclusively
    return await handleOpenAI(input, res);
  } catch (err) {
    return res.status(500).json({ error: err?.message || 'Unknown server error' });
  }
});

async function handleOpenAI(input, res) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Missing OPENAI_API_KEY env var for OpenAI provider' });
  }

  try {
    const model = 'text-embedding-3-small';
    const url = 'https://api.openai.com/v1/embeddings';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ model, input })
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: `OpenAI error: ${text}` });
    }

    const json = await response.json();
    const vector = json?.data?.[0]?.embedding;

    if (!Array.isArray(vector)) {
      return res.status(502).json({ error: 'Invalid embedding response from OpenAI' });
    }

    return res.status(200).json({ 
      embedding: vector, 
      provider: 'openai', 
      model,
      dimensions: vector.length
    });
  } catch (err) {
    return res.status(500).json({ error: `OpenAI error: ${err.message}` });
  }
}

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
