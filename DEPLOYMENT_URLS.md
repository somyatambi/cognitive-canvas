# 🚀 Cognitive Canvas - Deployment URLs

## Live Application
## Deployment / Local URLs

This project is intended to be run locally for development and testing.

- Frontend (local dev server): http://localhost:5173
- Backend gateway (Docker Compose / nginx): http://localhost:8080
- GitHub repository: https://github.com/somyatambi/cognitive-canvas-hackathon

If you deploy the backend to a cloud provider, update `frontend/src/config.ts` or set the `VITE_API_URL` environment variable in your frontend host to point to your backend's public URL.
- **Sponsor Technologies**: Docker MCP, Cerebras AI, Meta Llama

## Backend Endpoints (All Working ✅)
- `POST /brainstorm` - Generate startup ideas
- `POST /criticize` - Critique ideas with strengths/challenges
- `POST /roadmap` - Create strategic roadmap
- `POST /tasks` - Break down into actionable tasks
- `POST /pitchdeck` - Generate investor pitch deck

## Verification
Backend is fully operational and tested:
```bash
curl -X POST https://cognitive-canvas-hackathon-production.up.railway.app/brainstorm \
  -H "Content-Type: application/json" \
  -d '{"prompt": "test"}'
```

## Submission Date
October 5, 2025 - WeMakeDevs GenAI Hackathon 2025
