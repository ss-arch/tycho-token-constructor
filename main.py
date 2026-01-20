"""
Main entry point for Tycho Token Constructor
"""
import uvicorn
from config import API_CONFIG

if __name__ == "__main__":
    uvicorn.run(
        "api.app:app",
        host=API_CONFIG["host"],
        port=API_CONFIG["port"],
        reload=API_CONFIG["debug"]
    )
