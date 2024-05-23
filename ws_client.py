import asyncio
import websockets

async def connect():
    uri = "wss://switchbitch.online/ws/pi"
    #uri = "ws://localhost:3000/ws"
    async with websockets.connect(uri) as websocket:
        print("Connected to server")
        while True:
            message = await websocket.recv()
            print(f"Received message: {message}")

asyncio.run(connect())

