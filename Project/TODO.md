# Chatbot with RAG + LLM (Project/ only)

## Completed Steps:
- [x] sentence-transformers fixed
- [x] Update requirements.txt (fastapi uvicorn httpx)
- [x] Create app.py (FastAPI /chat: RAG retrieve → LLM API)

## Remaining Steps:
- [ ] cd Project && venv\Scripts\activate (if venv exists, else python -m venv venv)
- [ ] pip install -r requirements.txt
- [ ] uvicorn app:app --reload --port 8000
- [ ] Test: curl -X POST http://localhost:8000/chat -H "Content-Type: application/json" -d "{\"messages\":[{\"role\":\"user\",\"content\":\"what is ffmpeg\"}]}'

