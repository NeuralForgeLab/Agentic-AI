"""
06 - MCP Protocol (Server)
Model Context Protocol server exposing tools via HTTP.
Run with: uvicorn server:mcp_app --host 0.0.0.0 --port 8000
"""

from mcp.server.fastmcp import FastMCP

# Create MCP server with stateless HTTP enabled
mcp = FastMCP(name="travel-mcp", stateless_http=True)

# ------------------ Define Tools ------------------

@mcp.tool(name="food_finder", description="Find popular food spots in a given city")
def food_finder(city: str) -> dict:
    """Returns popular food spots for a given city."""
    food_spots = {
        "new york": [
            "Joe's Pizza",
            "Katz's Delicatessen",
            "Shake Shack",
            "Peter Luger Steak House",
            "Levain Bakery"
        ],
        "karachi": [
            "Kolachi Restaurant",
            "BBQ Tonight",
            "Cafe Flo",
            "Xander's",
            "Okra"
        ],
        "dubai": [
            "Al Ustad Special Kabab",
            "Zuma",
            "Ravi Restaurant",
            "Pierchic",
            "Tom&Serg"
        ],
        "london": [
            "Dishoom",
            "Sketch",
            "Borough Market",
            "The Ledbury",
            "Flat Iron"
        ]
    }

    city_lower = city.lower()
    if city_lower in food_spots:
        return {
            "city": city.title(),
            "spots": food_spots[city_lower]
        }
    else:
        return {
            "city": city.title(),
            "spots": [],
            "message": f"No food data available for {city}. Try New York, Karachi, Dubai, or London."
        }


@mcp.tool(name="hello_world", description="Return a friendly greeting")
def hello_world() -> str:
    """Simple hello world tool for testing."""
    return "Hello, World! MCP Server is working!"


@mcp.tool(name="weather_info", description="Get weather information for a city")
def weather_info(city: str) -> dict:
    """Returns mock weather data for demonstration."""
    # Mock weather data
    weather_data = {
        "new york": {"temp": "15°C", "condition": "Partly Cloudy"},
        "karachi": {"temp": "32°C", "condition": "Sunny"},
        "dubai": {"temp": "38°C", "condition": "Hot and Sunny"},
        "london": {"temp": "12°C", "condition": "Rainy"},
    }

    city_lower = city.lower()
    if city_lower in weather_data:
        return {
            "city": city.title(),
            **weather_data[city_lower]
        }
    else:
        return {
            "city": city.title(),
            "message": "Weather data not available for this city."
        }

# Expose HTTP app
mcp_app = mcp.streamable_http_app()
