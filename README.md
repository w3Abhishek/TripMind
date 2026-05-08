# TripMind 🌍

AI-powered travel planning web app with a Perplexity-style chat interface. Built with Next.js 14, FastAPI, and Google Gemini 2.5 Flash.

---

## Architecture

```
frontend/   → Next.js 14 (App Router, TypeScript, Tailwind CSS)
backend/    → Python FastAPI (Gemini AI, Image Search, Expense Parsing)
```

Both services are deployed independently to Google Cloud Run.

---

## Quick Start (Local Dev)

### 1. Clone & setup

```bash
git clone <repo>
cd Google_PromptWars
```

### 2. Backend

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Mac/Linux:
source .venv/bin/activate

pip install -r requirements.txt
```

Copy and fill `.env`:
```
GEMINI_API_KEY=...
GOOGLE_API_KEY=...       # Google Custom Search API key
GOOGLE_CSE_ID=...        # Your Custom Search Engine ID (optional)
```

Start backend:
```bash
uvicorn main:app --reload --port 8000
```

Backend will be live at `http://localhost:8000`
Swagger docs: `http://localhost:8000/docs`

### 3. Frontend

```bash
cd frontend
npm install
```

Copy and fill `.env.local`:
```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...    # optional
```

Start frontend:
```bash
npm run dev
```

App will be live at `http://localhost:3000`

---

## Environment Variables

### Frontend (`frontend/.env.local`)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase project API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID |
| `NEXT_PUBLIC_BACKEND_URL` | FastAPI backend URL |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps Embed API key (optional) |

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Google Gemini API key |
| `GOOGLE_API_KEY` | Google Custom Search API key |
| `GOOGLE_CSE_ID` | Google Custom Search Engine ID (optional) |

---

## Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** → Google sign-in provider
3. Enable **Firestore** database (start in production mode)
4. Enable **Storage**
5. Add your domain to authorized domains in Authentication settings
6. Copy config values to `frontend/.env.local`

### Firestore Rules (recommended)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /trips/{tripId} {
      allow read: if request.auth != null &&
        (resource.data.userId == request.auth.uid || resource.data.isPublic == true);
      allow write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
      match /messages/{messageId} {
        allow read, write: if request.auth != null;
      }
    }
    match /expenses/{expenseId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## Google Custom Search Setup (for destination images)

1. Go to [Programmable Search Engine](https://programmablesearchengine.google.com/)
2. Create a new search engine, enable **Image search**, set it to search the entire web
3. Copy the **Search Engine ID** → `GOOGLE_CSE_ID`
4. Enable Custom Search JSON API in [Google Cloud Console](https://console.cloud.google.com)
5. Use the same `GOOGLE_API_KEY` for both

Image fallback chain: **Google Custom Search → DuckDuckGo → Unsplash**

---

## Cloud Run Deployment

### Build & push images

```bash
# Backend
cd backend
gcloud builds submit --tag gcr.io/YOUR_PROJECT/tripmind-backend

# Frontend
cd frontend
gcloud builds submit --tag gcr.io/YOUR_PROJECT/tripmind-frontend
```

### Deploy backend

```bash
gcloud run deploy tripmind-backend \
  --image gcr.io/YOUR_PROJECT/tripmind-backend \
  --region us-central1 \
  --port 8080 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=...,GOOGLE_API_KEY=...,GOOGLE_CSE_ID=...
```

### Deploy frontend

```bash
gcloud run deploy tripmind-frontend \
  --image gcr.io/YOUR_PROJECT/tripmind-frontend \
  --region us-central1 \
  --port 8080 \
  --allow-unauthenticated \
  --set-env-vars NEXT_PUBLIC_BACKEND_URL=https://tripmind-backend-xxx-uc.a.run.app,...
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| UI Components | shadcn/ui, Radix UI, Lucide Icons |
| AI Model | Google Gemini 2.5 Flash |
| Backend | Python FastAPI, Uvicorn |
| Auth | Firebase Auth (Google OAuth) |
| Database | Firestore |
| Storage | Firebase Storage |
| Images | Google Custom Search → DuckDuckGo → Unsplash |
| Maps | Google Maps Embed API |
| Deploy | Google Cloud Run |
