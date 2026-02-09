"""
06 - MCP Protocol (Client)
Client that communicates with MCP server using JSON-RPC 2.0 protocol.
"""

import requests
import json

# MCP Server URL
URL = "http://localhost:8000/mcp"
HEADERS = {
    "Content-Type": "application/json",
    "Accept": "application/json, text/event-stream"
}


def call_mcp_tool(tool_name: str, arguments: dict = None) -> dict:
    """
    Call an MCP tool on the server.

    Args:
        tool_name: Name of the tool to call
        arguments: Dictionary of arguments to pass to the tool

    Returns:
        Response from the MCP server
    """
    request_payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "tools/call",
        "params": {
            "name": tool_name,
            "arguments": arguments or {}
        }
    }

    try:
        response = requests.post(URL, json=request_payload, headers=HEADERS, timeout=10)

        # Try parsing JSON response
        try:
            data = response.json()
        except Exception:
            # Handle event-stream style response
            lines = [line for line in response.text.splitlines() if line.strip()]
            data = json.loads(lines[-1]) if lines else None

        return data

    except requests.exceptions.ConnectionError:
        return {"error": "Could not connect to MCP server. Is it running?"}
    except Exception as e:
        return {"error": str(e)}


def print_result(data: dict):
    """Pretty print the MCP response."""
    if not data:
        print("No response received")
        return

    if "result" in data:
        result = data["result"]
        print(f"\nResult: {json.dumps(result, indent=2)}")
    elif "error" in data:
        print(f"\nError: {data['error']}")
    else:
        print(f"\nUnexpected response: {data}")


# ------------------ Main ------------------
if __name__ == "__main__":
    print("=" * 50)
    print("MCP Client - Testing Tools")
    print("=" * 50)

    # Test 1: Hello World
    print("\n[Test 1] Calling hello_world tool...")
    result = call_mcp_tool("hello_world")
    print_result(result)

    # Test 2: Food Finder
    print("\n[Test 2] Calling food_finder for Dubai...")
    result = call_mcp_tool("food_finder", {"city": "Dubai"})
    print_result(result)

    # Test 3: Weather Info
    print("\n[Test 3] Calling weather_info for London...")
    result = call_mcp_tool("weather_info", {"city": "London"})
    print_result(result)

    # Interactive mode
    print("\n" + "=" * 50)
    print("Interactive Mode - Enter city name to find food spots")
    print("(Type 'quit' to exit)")
    print("=" * 50)

    while True:
        city = input("\nEnter city name: ").strip()
        if city.lower() == 'quit':
            break

        result = call_mcp_tool("food_finder", {"city": city})
        print_result(result)
