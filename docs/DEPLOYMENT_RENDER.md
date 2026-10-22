# Deploying PayVantage to Render via Docker

This guide explains how to deploy both the **FastAPI Backend** and **Next.js Frontend** to [Render](https://render.com) using the included Dockerfiles.

---

## Option 1: Automatic Deployment with Render Blueprint (Recommended)

The repository includes a root [`render.yaml`](../render.yaml) blueprint specification that automatically configures both services and connects the frontend to the backend.

1. Push your changes to your GitHub repository.
2. Log in to your [Render Dashboard](https://dashboard.render.com).
3. Click **New +** in the top navigation and select **Blueprint**.
4. Connect your GitHub repository (`incubyte-salary-management-rajpatel`).
5. Render will detect `render.yaml` and show:
   - `payvantage-backend` (Docker Web Service)
   - `payvantage-frontend` (Docker Web Service)
6. Click **Apply**.
7. Render will build and launch both services automatically!

---

## Option 2: Manual Deployment as Two Docker Web Services

If you prefer to create the services individually in the Render UI:

### Step 1: Deploy Backend API

1. In Render Dashboard, click **New +** → **Web Service**.
2. Connect your GitHub repo.
3. Configure the settings:
   - **Name**: `payvantage-backend`
   - **Runtime**: `Docker`
   - **Docker Command / Context**: `./backend`
   - **Dockerfile Path**: `./backend/Dockerfile`
   - **Plan**: `Free` (or Starter)
4. Under **Advanced**:
   - **Health Check Path**: `/health`
5. Click **Create Web Service**.
6. Once deployed, copy your backend URL (e.g., `https://payvantage-backend.onrender.com`).

---

### Step 2: Deploy Frontend UI

1. In Render Dashboard, click **New +** → **Web Service**.
2. Connect your GitHub repo.
3. Configure the settings:
   - **Name**: `payvantage-frontend`
   - **Runtime**: `Docker`
   - **Docker Command / Context**: `./frontend`
   - **Dockerfile Path**: `./frontend/Dockerfile`
   - **Plan**: `Free` (or Starter)
4. Under **Environment Variables**:
   - Add: `NEXT_PUBLIC_API_URL` = `https://payvantage-backend.onrender.com` *(replace with your actual backend URL from Step 1)*
5. Click **Create Web Service**.
6. Once built, open your frontend URL to access the PayVantage dashboard!

---

## Technical Details

### Dynamic Port Binding (`$PORT`)
- Render injects the `$PORT` environment variable dynamically at runtime (typically port `10000`).
- Both `backend/Dockerfile` and `frontend/Dockerfile` are configured to listen on `0.0.0.0` at `${PORT:-8000}` and `${PORT:-3000}` respectively.

### SQLite Database Seeding
- On first container startup, `backend/Dockerfile` automatically runs `python seed.py 10000` in ~2.5 seconds to populate the SQLite database.
- Subsequent restarts detect existing data and start immediately without re-seeding (unless `FORCE_SEED=true` is set).

### Cross-Origin Resource Sharing (CORS)
- `backend/app/main.py` is configured with `allow_origin_regex=r"https?://.*\.onrender\.com"` so the frontend can communicate with the backend on any Render subdomain without CORS restrictions.
