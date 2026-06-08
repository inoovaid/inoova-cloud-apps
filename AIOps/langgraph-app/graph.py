from fastapi import FastAPI
from pydantic import BaseModel

from agents.cluster_operator.agent import run_cluster_operator
from agents.gitops_operator.agent import run_gitops_operator
from agents.noc_operator.agent import run_noc_operator

app = FastAPI()

class Question(BaseModel):
    question: str

def route(question: str):

    q = question.lower()

    if any(x in q for x in [
        "node",
        "nodes",
        "namespace",
        "namespaces",
        "pod",
        "deployment",
        "service",
        "cluster"
    ]):
        return "cluster"

    if any(x in q for x in [
        "argocd",
        "github",
        "git",
        "pull request",
        "commit",
        "sync"
    ]):
        return "gitops"

    if any(x in q for x in [
        "cpu",
        "memory",
        "loki",
        "prometheus",
        "logs",
        "crashloop"
    ]):
        return "noc"

    return "cluster"

@app.get("/")
def health():
    return {"status": "ok"}

@app.post("/ask")
async def ask(data: Question):

    agent = route(data.question)

    if agent == "cluster":
        return await run_cluster_operator(data.question)

    if agent == "gitops":
        return await run_gitops_operator(data.question)

    if agent == "noc":
        return await run_noc_operator(data.question)

    return {"error": "agent not found"}
