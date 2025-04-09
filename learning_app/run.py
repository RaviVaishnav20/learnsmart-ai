import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "app:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        workers=4,  # Use multiple workers for better performance
        loop="uvloop",  # Use uvloop for better async performance
        limit_concurrency=100,  # Limit concurrent connections
        timeout_keep_alive=30  # Keep connections alive for 30 seconds
    )