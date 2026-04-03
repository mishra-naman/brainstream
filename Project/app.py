from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import httpx
from rag.query import query_chroma
from rag.db import model
import json

app = FastAPI(title="OTT RAG Chatbot")

LLM_URL = "https://unenlisted-madeline-unsparsely.ngrok-free.dev/api/chat"

class ChatRequest(BaseModel):
    messages: List[Dict[str, str]]

@app.post("/chat")
async def chat(request: ChatRequest):
    # Extract user query from last message
    user_query = request.messages[-1]["content"] if request.messages else ""

    if not user_query:
        raise HTTPException(status_code=400, detail="No user query")

    # RAG: Retrieve top 3 contexts
    contexts = query_chroma(user_query, top_k=3)[0]
    context_str = "\n\n".join(contexts)

    # Augmented prompt
    system_prompt = f"""You are an OTT/Video Streaming expert. Use ONLY the following contexts to answer. Be concise and accurate.

Contexts:
{context_str}"""

    llm_request = {
        "model": "llama3.2",
        "stream": False,
        "messages": [
            {"role": "system", "content": system_prompt},
            *request.messages
        ]
    }

    # Call LLM API
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(LLM_URL, json=llm_request, timeout=60.0)
            resp.raise_for_status()
            result = resp.json()
            
            # Flexible parsing for LLM response (handles custom formats)
            if "choices" in result and result["choices"]:
                content = result["choices"][0]["message"]["content"]
            elif "message" in result:
                content = result["message"]["content"]
            elif "content" in result:
                content = result["content"]
            else:
                content = str(result)  # fallback
                
            return {
                "response": content,
                "contexts_used": len(contexts),
                "contexts": contexts[:2]  # preview
            }
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=500, detail=f"LLM API HTTP {e.response.status_code}: {e.response.text[:200]}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"LLM API error: {str(e)}")


@app.get("/")
async def root():
    return {"message": "OTT RAG Chatbot ready! POST to /chat. /docs for Swagger."}

@app.post("/test-llm")
async def test_llm():
    """Test raw LLM API call without RAG"""
    llm_request = {
        "model": "llama3.2",
        "stream": False,
        "messages": [{"role": "user", "content": "hello"}]
    }
    async with httpx.AsyncClient() as client:
        resp = await client.post(LLM_URL, json=llm_request)
        return {"raw_response": resp.json(), "status": resp.status_code}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
