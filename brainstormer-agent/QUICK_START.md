# 🚀 Quick Start Guide - Brainstormer Agent v2.0

## ⚠️ Prerequisites

Before running the agent, you need:

1. **OpenRouter API Key** - Get one from: https://openrouter.ai/keys
2. **Python 3.8+** installed
3. **Dependencies** installed (fastapi, uvicorn, openai, pydantic)

---

## 📋 Setup Instructions

### Step 1: Get Your API Key
1. Go to https://openrouter.ai/keys
2. Sign up/Login
3. Create a new API key
4. Copy the key (starts with `sk-or-v1-...`)

### Step 2: Set Up Environment Variable

**Option A: Create .env file (Recommended)**
```bash
# In the project root directory
echo OPENROUTER_API_KEY=sk-or-v1-your-key-here > .env
```

**Option B: Set in current terminal session**

**Windows PowerShell:**
```powershell
$env:OPENROUTER_API_KEY = "sk-or-v1-your-key-here"
```

**Windows CMD:**
```cmd
set OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

**Linux/Mac:**
```bash
export OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

**Option C: Set permanently (Windows)**
```powershell
[System.Environment]::SetEnvironmentVariable('OPENROUTER_API_KEY', 'sk-or-v1-your-key-here', 'User')
```

### Step 3: Install Dependencies
```bash
cd brainstormer-agent
pip install -r requirements.txt
```

### Step 4: Start the Server
```bash
uvicorn main:app --port 8001 --reload
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8001
INFO:     Started reloader process [xxxxx] using WatchFiles
INFO:     Started server process [xxxxx]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### Step 5: Test the API

**Health Check:**
```bash
curl http://localhost:8001/
```

Expected response:
```json
{"status":"ok","agent":"Brainstormer Agent","message":"Agent is running"}
```

**Test with Python script:**
```bash
python test_brainstormer.py
```

---

## 🧪 Quick Manual Test

**PowerShell:**
```powershell
$body = @{
    prompt = "AI"
    mode = "keyword"
    persona = "hackathon"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8001/generate" -Method Post -Body $body -ContentType "application/json"
```

**cURL:**
```bash
curl -X POST http://localhost:8001/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt":"AI","mode":"keyword","persona":"hackathon"}'
```

---

## 🐋 Using Docker (Alternative)

If you prefer Docker:

1. Create `.env` file in project root with your API key
2. Run:
```bash
docker-compose up brainstormer-agent
```

---

## ❌ Troubleshooting

### Error: "The api_key client option must be set"
- **Cause**: OPENROUTER_API_KEY not set
- **Fix**: Follow Step 2 above

### Error: "Module not found"
- **Cause**: Dependencies not installed
- **Fix**: Run `pip install -r requirements.txt`

### Error: "Address already in use"
- **Cause**: Port 8001 is already taken
- **Fix**: Use a different port: `uvicorn main:app --port 8002`

### Error: "Connection refused"
- **Cause**: Server not started
- **Fix**: Make sure uvicorn is running

---

## 📖 Next Steps

Once the server is running:
1. Try all 6 modes (keyword, expand, merge, analyze, score, refine)
2. Read [API_USAGE.md](API_USAGE.md) for detailed documentation
3. Check [FRONTEND_EXAMPLE.ts](FRONTEND_EXAMPLE.ts) for integration examples
4. Review [UPDATE_SUMMARY.md](UPDATE_SUMMARY.md) for all features

---

## 💡 Example Requests

### Mode 1: Keyword Ideas
```json
{"prompt": "sustainability", "mode": "keyword", "persona": "entrepreneur"}
```

### Mode 2: Expand Idea
```json
{"prompt": "AI resume builder", "mode": "expand", "persona": "student"}
```

### Mode 3: Merge Ideas
```json
{
  "prompt": "AI fitness coach",
  "mode": "merge",
  "persona": "entrepreneur",
  "secondary_input": "Gamified habit tracker"
}
```

### Mode 4: Analyze Market
```json
{"prompt": "Code review automation tool", "mode": "analyze", "persona": "entrepreneur"}
```

### Mode 5: Score Ideas
```json
{
  "prompt": "Notion templates | AI grader | Event finder",
  "mode": "score",
  "persona": "student"
}
```

### Mode 6: Refine Idea
```json
{
  "prompt": "app for sharing ideas with ai",
  "mode": "refine",
  "persona": "hackathon"
}
```

---

## 🎯 Ready to Go!

Your Brainstormer Agent v2.0 with 6-mode MASTER IDEA ENGINE is now set up! 🎨✨
