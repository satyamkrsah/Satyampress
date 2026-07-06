# Deployment Guide

The Satyam Printing Press application is fully containerized and features CI/CD pipelines via GitHub Actions.

## Recommended Cloud Providers
- **Frontend:** Vercel or AWS S3 + CloudFront (or containerized via NGINX).
- **Backend:** Render, Heroku, or AWS EC2 (Docker).
- **Database:** MongoDB Atlas (Cloud Database).
- **Media Storage:** Cloudinary.

## Option 1: Docker Compose (Production Server - EC2/VPS)
1. Provision a Linux server (Ubuntu recommended).
2. Install Docker and Docker Compose.
3. Clone the repository.
4. Populate `backend/.env` with your production API keys.
5. Create `docker-compose.prod.yml` mapping ports 80 and 443 appropriately.
6. Run:
```bash
docker-compose -f docker-compose.prod.yml up --build -d
```
7. Configure a reverse proxy (NGINX/Caddy) to handle SSL certificates via Let's Encrypt and forward traffic to the respective Docker ports.

## Option 2: Managed Platforms (Vercel + Render)

### Backend Deployment (Render)
1. Create a new Web Service on Render connected to your GitHub repo.
2. Root Directory: `backend`
3. Build Command: `npm install`
4. Start Command: `npm start`
5. In the Render Dashboard, add all Environment Variables from your `.env` file (ensure `NODE_ENV` is set to `production`).

### Frontend Deployment (Vercel)
1. Import the repository into Vercel.
2. Root Directory: `Frontend`
3. Framework Preset: Vite
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Under Environment Variables, add `VITE_API_URL` pointing to your deployed Render backend URL (e.g., `https://satyampress-api.onrender.com/api`).

## CI/CD Pipeline
The project includes a `.github/workflows/deploy.yml` pipeline that triggers on pushes to the `main` branch.
- It spins up a test runner, executes `npm run test` on the backend.
- It builds the React application to verify no compile-time errors exist.
- Upon success, it triggers deployment webhooks for production servers.
