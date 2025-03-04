import asyncio
from httpx_ws import aconnect_ws
from pycrdt import Doc, Map, Array
from pycrdt_websocket import WebsocketProvider
from pycrdt_websocket.websocket import HttpxWebsocket
import time

ydoc = Doc()
# 
room_name = "vue-yjs-demo-messages"
yarray = ydoc.get("conversation1", type=Array);




import threading

# def printit():
#   threading.Timer(5.0, printit).start()
#   print ("Hello, World!")
#   ymap["key"] = time.time()

# printit()

async def user_input():
    while True:
        loop = asyncio.get_event_loop()
        content = await loop.run_in_executor(None, input, "> ")
        print(content)
        # ymap = ydoc.get("map", type=Map)
        # ymap["text"] = content
        # print(ydoc)
        ymap = Map({
            "clientID": ydoc.client_id,
            "text": content,
            "username": "pythonUser",
            "role": "human_cli",
            "action": "chat",
            "timestamp": time.time()
            })
        yarray.append(ymap)

def handle_deep_changes(events):
    print(events)
    print("to_py\n", yarray.to_py())
    print("User:")

async def client():

    async with (
        aconnect_ws(f"http://localhost:1234/{room_name}") as websocket,
        WebsocketProvider(ydoc, HttpxWebsocket(websocket, room_name)),
    ):
        # Changes to remote ydoc are applied to local ydoc.
        # Changes to local ydoc are sent over the WebSocket and
        # broadcast to all clients.
        # ymap["key"] = time.time()

        # array0_subscription_id = ymap.observe_deep(handle_deep_changes)
        array0_subscription_id = yarray.observe_deep(handle_deep_changes)
        await asyncio.Future()  # run forever

# asyncio.run(client())
async def main():
    tasks = [user_input(), client()]
    await asyncio.gather(*tasks)


loop = asyncio.get_event_loop()
loop.run_until_complete(main())
loop.close()