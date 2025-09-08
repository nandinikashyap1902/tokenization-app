# Security Guidelines

## API Key Management

### ⚠️ NEVER commit API keys to version control

1. **Use .env files**: Store your API keys in `.env` files which are gitignored
2. **Use .env.example**: Provide template files with placeholder values
3. **Environment Variables**: Use environment variables in production

### Setting up API Keys

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Replace placeholder values in `.env` with your actual API keys:
   ```
   OPENAI_API_KEY=sk-proj-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

3. **NEVER** edit `.env.example` with real API keys - it should only contain placeholders

### Best Practices

- ✅ Use placeholder values like `sk-proj-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`
- ✅ Keep `.env` files in `.gitignore`
- ✅ Use environment variables in deployment
- ✅ Regularly rotate API keys
- ❌ Never hardcode API keys in source code
- ❌ Never commit `.env` files to git
- ❌ Never share API keys in chat, email, or documentation

### If API Keys Are Exposed

1. **Immediately revoke** the exposed API key from your provider dashboard
2. **Generate a new API key**
3. **Remove sensitive data** from git history if needed:
   ```bash
   git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch .env' --prune-empty --tag-name-filter cat -- --all
   ```
4. **Force push** to remote repository (use with caution)

### Environment Variables for Deployment

For platforms like Vercel, Netlify, or Heroku:
- Set environment variables in the platform's dashboard
- Never commit production credentials to the repository
