from fastapi import FastAPI
from langchain_ollama import ChatOllama

app = FastAPI()

llm = ChatOllama(
    model="gemma3:4b",
    base_url="http://ollama-agents.ai-system.svc.cluster.local:11434"
)

@app.get("/")
def health():
    return {
        "status": "ok",
        "model": "gemma3:4b"
    }
