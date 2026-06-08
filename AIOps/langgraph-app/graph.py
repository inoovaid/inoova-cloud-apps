from fastapi import FastAPI
from langchain_ollama import ChatOllama

app = FastAPI()

llm = ChatOllama(
    model="gemma3:4b",
    base_url="http://ollama-agents.ai-system.svc.cluster.local:11434"
)

@app.get("/")
def root():
    return {"status": "ok"}

@app.get("/chat")
def chat(q: str):
    response = llm.invoke(q)
    return {"response": response.content}
