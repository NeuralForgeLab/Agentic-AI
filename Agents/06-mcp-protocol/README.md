# 06 - MCP Protocol (Model Context Protocol)

## Concept

**MCP (Model Context Protocol)** is a standardized way to expose tools via HTTP, allowing any client to discover and call them using JSON-RPC 2.0.

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   MCP Client                     │
│              (Python, JS, etc.)                 │
└─────────────────────┬───────────────────────────┘
                      │ HTTP POST (JSON-RPC 2.0)
                      │
                      │  {
                      │    "jsonrpc": "2.0",
                      │    "method": "tools/call",
                      │    "params": {
                      │      "name": "food_finder",
                      │      "arguments": {"city": "Dubai"}
                      │    }
                      │  }
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│                   MCP Server                     │
│                 (FastMCP)                       │
│                                                  │
│   ┌─────────────┐ ┌─────────────┐              │
│   │ food_finder │ │ hello_world │  ...         │
│   └─────────────┘ └─────────────┘              │
└─────────────────────┬───────────────────────────┘
                      │
                      │  {
                      │    "jsonrpc": "2.0",
                      │    "result": {
                      │      "city": "Dubai",
                      │      "spots": ["Zuma", ...]
                      │    }
                      │  }
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│                   Response                       │
└─────────────────────────────────────────────────┘
```

## Server Side (`server.py`)

```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP(name="travel-mcp", stateless_http=True)

@mcp.tool(name="food_finder", description="Find food spots in a city")
def food_finder(city: str) -> dict:
    # Tool implementation
    return {"city": city, "spots": [...]}

# Expose HTTP app
mcp_app = mcp.streamable_http_app()
```

## Client Side (`client.py`)

```python
import requests

url = "http://localhost:8000/mcp"
headers = {"Content-Type": "application/json"}

request = {
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
        "name": "food_finder",
        "arguments": {"city": "Dubai"}
    }
}

response = requests.post(url, json=request, headers=headers)
print(response.json())
```

## Key Components

| Component | Description |
|-----------|-------------|
| `FastMCP` | MCP server framework |
| `@mcp.tool()` | Decorator to define tools |
| `streamable_http_app()` | Creates HTTP endpoint |
| JSON-RPC 2.0 | Communication protocol |

## JSON-RPC 2.0 Format

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "tool_name",
    "arguments": { ... }
  }
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": { ... }
}
```

## Running the Example

1. Start the server:
   ```bash
   uvicorn server:mcp_app --host 0.0.0.0 --port 8000
   ```

2. Run the client:
   ```bash
   python client.py
   ```

## Use Cases

- Microservices architecture
- Tool sharing across applications
- Language-agnostic integrations
- Remote function execution
- AI agent tool providers
