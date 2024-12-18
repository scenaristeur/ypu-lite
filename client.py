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
test_resp = "{target: 'Alice', 'id': 'd6e6929f-83fd-4d46-b24c-0c1e5b4173b3', 'clientID': 391315234.0, 'text': \"Salut! Comment puis-je vous aider aujourd'hui?\", 'timestamp': 1734299878511.0, 'action': 'chat', 'username': 'ai', 'role': 'ai'}"

async def client():
    ydoc = Doc()
    # ymap = ydoc.get("map", type=Map)
    yarray = ydoc.get("conversation1", type=Array);
    room_name = sync_room #"my-roomname"

    def handle_deep_changes(events: list[ArrayEvent]):
    # process the events
        print("to_py\n", yarray.to_py()) 
        print(events)
        for event in events:
            print("-", event.target)
            print("\ndelta\n", event.delta)
            print("\npath\n", event.path)
            print("\insert\n", event.delta[0]["insert"])
            for item in event.delta[0]["insert"]:
                print("item", item.to_py())
            # print("\ninsert to_py\n", event.delta[0]["insert"])


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
        # # Initializing an empty list to store numbers
        # number_list = []

        # # Prompting the user to enter numbers
        # while True:
        #     num = input('Enter a number (or "done" to finish): ')
        #     if num == 'done':
        #         break
        #     number_list.append(int(num))

        # # Printing the list of numbers
        # print('List of numbers:', number_list)


asyncio.run(client())