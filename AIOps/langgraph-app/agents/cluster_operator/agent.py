from mcp_client import mcp

async def run_cluster_operator(question):

    tools = await mcp.tools_list()

    return {
        "agent": "cluster-operator",
        "question": question,
        "tools": tools
    }
