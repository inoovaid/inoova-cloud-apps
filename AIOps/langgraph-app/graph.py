from typing import TypedDict

from langgraph.graph import StateGraph, END
from langchain_ollama import ChatOllama

llm = ChatOllama(
    model="gemma3:4b",
    base_url="http://ollama-agents.ai-system.svc.cluster.local:11434"
)

class AgentState(TypedDict):
    question: str
    answer: str

def chat_node(state):

    response = llm.invoke(state["question"])

    return {
        "answer": response.content
    }

graph = StateGraph(AgentState)

graph.add_node("chat", chat_node)

graph.set_entry_point("chat")

graph.add_edge("chat", END)

agent = graph.compile()

while True:

    question = input("Pergunta: ")

    result = agent.invoke(
        {
            "question": question
        }
    )

    print(result["answer"])
