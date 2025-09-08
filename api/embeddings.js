// Vercel Serverless Function: Generate embeddings using OpenAI exclusively

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
}

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
