import asyncio
from httpx_ws import aconnect_ws
from pycrdt import Doc, Map, Text
from pycrdt_websocket import WebsocketProvider
from pycrdt_websocket.websocket import HttpxWebsocket


def on_update_event(change_event, key, event):
    print('Received update. Current text:', change_event, key, event)
    # if key is None or key in event.keys:
    #     change_event.set()

async def client():
    ydoc = Doc()
    ymap = ydoc.get("map", type=Map)
    ytext = ydoc.get("shared", type=Text)
    room_name = 'vue-yjs-demo'


    async with (
        aconnect_ws(f"https://ypu.glitch.me/{room_name}") as websocket,
        WebsocketProvider(ydoc, HttpxWebsocket(websocket, room_name)),
    ):
        # Changes to remote ydoc are applied to local ydoc.
        # Changes to local ydoc are sent over the WebSocket and
        # broadcast to all clients.
        on_update_event("test", None, None)
        ymap["key"] = "value"
        ytext.observe(on_update_event)
        ytext.insert(0, "ola")    
        # ytext.observe(lambda event: print('Received update. Current text:', ytext.get()))
        # print(ytext.__dict__)


        await asyncio.Future()  # run forever

asyncio.run(client())
