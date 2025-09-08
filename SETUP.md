# 🚀 Quick Setup Guide

## ⚠️ Fix "Connection failed" Error

### Step 1: Create Environment File
1. Copy the `.env.example` file to `.env`:
   ```
   OPENAI_API_KEY=sk-proj-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   PORT=3001
   ```

2. Get your OpenAI API key:
   - Visit https://platform.openai.com/api-keys
   - Create a new secret key
   - Replace the placeholder with your actual key

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Start the Application
```bash
# Start both frontend and backend
npm run dev

# OR start them separately:
# Terminal 1: Backend server
npm run server

# Terminal 2: Frontend
npm start
```

### Step 4: Test Embeddings
1. Open http://localhost:3000
2. Navigate to the "Embeddings" tab
3. Enter some text and click "Generate Embedding"
4. Should work without connection errors!

## 🛠️ Troubleshooting

### "Connection failed" Error:
- ✅ **Fixed**: Server health check added
- ✅ **Fixed**: Better error messages for missing API key
- ✅ **Fixed**: Development server detection

### Common Issues:
1. **Missing API key**: Make sure `.env` file exists with valid `OPENAI_API_KEY`
2. **Server not running**: Use `npm run dev` to start both frontend and backend
3. **Port conflicts**: Change `PORT=3001` in `.env` if port is in use

## 📁 Architecture
- **Frontend**: React app (localhost:3000)
- **Backend**: Express server (localhost:3001) 
- **Production**: Vercel serverless functions (`/api/embeddings`)
