from langgraph.graph import StateGraph

def router(state):

    question = state["question"].lower()

    if "node" in question:
        return "kubernetes"

    if "pod" in question:
        return "kubernetes"

    if "namespace" in question:
        return "kubernetes"

    return "llm"

graph = StateGraph(dict)

graph.add_node("router", router)

graph.set_entry_point("router")
