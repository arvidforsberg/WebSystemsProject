import asyncio
import websockets

'''async def echo_test():
    uri = "ws://localhost:3000/echo"
    async with websockets.connect(uri) as websocket:
        message = "Hello, WebSocket!"
        await websocket.send(message)
        print(f"Sent: {message}")

        response = await websocket.recv()
        print(f"Received: {response}")

asyncio.get_event_loop().run_until_complete(echo_test())'''

async def connect():
    uri = "ws://16.170.247.233/ws"
    async with websockets.connect(uri) as websocket:
        print("Connected to server")
        while True:
            message = await websocket.recv()
            print(f"Received message: {message}")

asyncio.run(connect())
