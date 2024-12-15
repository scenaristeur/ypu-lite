import os 
import asyncio
from httpx_ws import aconnect_ws
from pycrdt import Doc, Map, Array, ArrayEvent
from pycrdt_websocket import WebsocketProvider
from pycrdt_websocket.websocket import HttpxWebsocket
from dotenv import load_dotenv
load_dotenv()  # take environment variables from .env.

sync_url = os.getenv ("SYNC_URL")
sync_room = os.getenv ("SYNC_ROOM")


async def client():
    ydoc = Doc()
    # ymap = ydoc.get("map", type=Map)
    yarray = ydoc.get("conversation1", type=Array);
    room_name = sync_room #"my-roomname"

    def handle_deep_changes(events: list[ArrayEvent]):
    # process the events
        print(events)
        for event in events:
            print("-", event.target)
            print("\ndelta\n", event.delta)
            print("\npath\n", event.path)
        print("to_py\n", yarray.to_py()) 

    async with (
        aconnect_ws(f"{sync_url}/{room_name}") as websocket,
        WebsocketProvider(ydoc, HttpxWebsocket(websocket, room_name)),
    ):
        # Changes to remote ydoc are applied to local ydoc.
        # Changes to local ydoc are sent over the WebSocket and
        # broadcast to all clients.
        #yarray["key"] = "value"



        array0_subscription_id = yarray.observe_deep(handle_deep_changes)

        await asyncio.Future()  # run forever

asyncio.run(client())