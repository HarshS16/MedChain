# MedChain Deployment Guide (Zero-Cost Architecture)

This guide provides a minimal, step-by-step deployment plan to make the MedChain project accessible online for completely **free**, utilizing generous cloud free-tiers.

## 🏗️ Architecture & Free Providers

MedChain consists of several microservices. Here is where each component will be hosted for free:

| Component | Tech Stack | Free Hosting Provider |
| :--- | :--- | :--- |
| **Frontend** | Next.js | **Vercel** (Automatic CI/CD, generous free tier) |
| **Backend API** | Node.js (Express) | **Render** (Free Web Service) |
| **AI Service** | Python (FastAPI) | **Render** (Free Web Service) or **Hugging Face Spaces** |
| **Database** | PostgreSQL (pgvector) | **Supabase** (Free Tier - 500MB DB, Pauses after 1 week inactivity) |
| **Storage** | IPFS | **Pinata Cloud** (1GB Free Storage) |
| **Blockchain** | Hyperledger Fabric | **Mock Mode** (or Oracle Cloud Always Free VM) |

> [!WARNING] 
> **Blockchain Limitations on Free Tiers**
> A full Hyperledger Fabric network requires multiple Docker containers and significant RAM (typically 4GB+). Standard free tiers (like Render or Heroku) cannot support this. 
> **Solution:** The backend currently supports a `MOCK MODE` fallback when Fabric is unreachable. For a true zero-cost deployment, rely on this Mock Mode, or deploy the Fabric network on an **Oracle Cloud Always Free** ARM instance (up to 24GB RAM) using your `docker-compose`.

---

## 🚀 Step-by-Step Deployment Plan

### Step 1: Database (Supabase)
1. Go to [Supabase](https://supabase.com/) and create a free project.
2. Under **Project Settings -> Database**, get your `Transaction` connection string.
3. Run your Prisma migrations against this database from your local machine:
   ```bash
   cd backend
   npx prisma migrate deploy
   ```

### Step 2: Decentralized Storage (Pinata)
1. Go to [Pinata Cloud](https://app.pinata.cloud/) and create a free account.
2. Generate an API Key and JWT. Save these credentials for the backend environment variables.

### Step 3: Deploy AI Service (Render)
1. Push your code to a GitHub repository.
2. Go to [Render](https://render.com/) and create a new **Web Service**.
3. Connect your GitHub repo and select the `ai/` directory as the Root Directory.
4. Set the Build Command: `pip install -r requirements.txt`
5. Set the Start Command: `uvicorn src.api.app:app --host 0.0.0.0 --port 10000`
6. Once deployed, copy the Render URL (e.g., `https://medchain-ai.onrender.com`).

### Step 4: Deploy Backend API (Render)
1. Create another **Web Service** on Render.
2. Select the `backend/` directory as the Root Directory.
3. Set the Build Command: `npm install`
4. Set the Start Command: `npm start`
5. Add the following **Environment Variables**:
   - `DATABASE_URL`: (Your Supabase URL)
   - `PINATA_API_KEY`, `PINATA_SECRET_KEY`, `PINATA_JWT`: (From Step 2)
   - `AI_SERVICE_URL`: (The URL from Step 3)
   - `OPENROUTER_API_KEY`: (Your OpenRouter Key)
   - `NODE_ENV`: `production`
6. Once deployed, copy the Render URL (e.g., `https://medchain-backend.onrender.com`).

### Step 5: Deploy Frontend (Vercel)
1. Go to [Vercel](https://vercel.com/) and create a new project.
2. Import your GitHub repository.
3. Set the Root Directory to `frontend/`.
4. Add the following **Environment Variable**:
   - `NEXT_PUBLIC_API_URL`: (The Backend URL from Step 4)
5. Click **Deploy**. Vercel will automatically build the Next.js app and provide a live `.vercel.app` URL.

---

## 💡 Important Notes for Free Tiers
- **Cold Starts:** Render's free web services sleep after 15 minutes of inactivity. When a user accesses the site after it has slept, the backend/AI service may take up to 30-50 seconds to spin back up.
- **Supabase Pausing:** Supabase pauses free databases after 1 week of inactivity. You will need to log in to the Supabase dashboard to unpause it if you don't use it frequently.
