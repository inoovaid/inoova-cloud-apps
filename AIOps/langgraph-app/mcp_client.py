import os
import httpx

MCP_URL = os.getenv(
    "MCP_URL",
    "http://mcp-kubernetes.ai-system.svc.cluster.local:8000/mcp"
)


class MCPClient:

    def __init__(self):
        self.session_id = None

    async def initialize(self):

        async with httpx.AsyncClient(timeout=30) as client:

            response = await client.get(
                MCP_URL,
                headers={
                    "Accept": "application/json, text/event-stream"
                }
            )

            self.session_id = response.headers.get(
                "mcp-session-id"
            )

            if not self.session_id:
                raise Exception(
                    "MCP session id not received"
                )

        return self.session_id

    async def tools_list(self):

        if not self.session_id:
            await self.initialize()

        async with httpx.AsyncClient(timeout=30) as client:

            response = await client.post(
                MCP_URL,
                headers={
                    "Content-Type": "application/json",
                    "Accept": "application/json, text/event-stream",
                    "mcp-session-id": self.session_id
                },
                json={
                    "jsonrpc": "2.0",
                    "id": 1,
                    "method": "tools/list",
                    "params": {}
                }
            )

            return response.json()

    async def call_tool(
        self,
        tool_name: str,
        arguments: dict
    ):

        if not self.session_id:
            await self.initialize()

        async with httpx.AsyncClient(timeout=120) as client:

            response = await client.post(
                MCP_URL,
                headers={
                    "Content-Type": "application/json",
                    "Accept": "application/json, text/event-stream",
                    "mcp-session-id": self.session_id
                },
                json={
                    "jsonrpc": "2.0",
                    "id": 2,
                    "method": "tools/call",
                    "params": {
                        "name": tool_name,
                        "arguments": arguments
                    }
                }
            )

            try:
                return response.json()
            except Exception:
                return {
                    "status_code": response.status_code,
                    "content": response.text
                }


mcp = MCPClient()
