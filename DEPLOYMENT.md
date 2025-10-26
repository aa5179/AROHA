# Deployment Instructions

## Backend Deployment (Recommended: Railway/Render)

Due to the size of ML libraries (torch, transformers), deploying the backend to Railway or Render is recommended over Vercel.

### Railway Deployment:

1. Create account at railway.app
2. Connect your GitHub repository
3. Set environment variables:
   - `GEMINI_API_KEY` (optional, for AI features)
   - `OPENAI_API_KEY` (optional)
   - `HUGGINGFACE_API_TOKEN` (optional)
4. Deploy from `server/` directory
5. Note the deployed URL (e.g., https://your-app.railway.app)

### Render Deployment:

1. Create account at render.com
2. Create new Web Service
3. Connect your repository
4. Set:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python main.py`
   - Root Directory: `server`
5. Add environment variables in dashboard

## Frontend Deployment (Vercel)

### Steps:

1. Update `VITE_API_URL` in your environment variables to your backend URL
2. Push to GitHub
3. Connect Vercel to your repository
4. Set build settings:
   - Framework: Vite
   - Root Directory: `client`
5. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_API_URL` (your backend URL)

## Environment Variables Needed:

### Client (.env):

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=https://your-backend-url.railway.app
```

### Server (.env):

```
GEMINI_API_KEY=your_gemini_key (optional)
OPENAI_API_KEY=your_openai_key (optional)
HUGGINGFACE_API_TOKEN=your_hf_token (optional)
DEBUG=False
ENVIRONMENT=production
```

## Alternative: Frontend-Only Deployment

If you want to deploy only the frontend without the backend:

1. Comment out or disable AI features
2. The app will work with Supabase for auth and data storage
3. Mental health tips will be static

## Post-Deployment:

1. Test all features
2. Update CORS origins in backend with your Vercel URL
3. Monitor logs for any issues
