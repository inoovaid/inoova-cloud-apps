import httpx

MCP_URL = "http://mcp-kubernetes.ai-system.svc.cluster.local:8000/mcp"

async def run_cluster_operator(question):

    return {
        "agent": "cluster-operator",
        "question": question,
        "tool": "kubernetes-mcp"
    }
