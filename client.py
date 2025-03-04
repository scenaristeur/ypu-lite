import os , time
import asyncio
from httpx_ws import aconnect_ws
from pycrdt import Doc, Map, Array, ArrayEvent
from pycrdt_websocket import WebsocketProvider
from pycrdt_websocket.websocket import HttpxWebsocket
from dotenv import load_dotenv
load_dotenv()  # take environment variables from .env.

sync_url = os.getenv ("SYNC_URL") or 'ws://localhost:1234'
sync_room = os.getenv ("SYNC_ROOM") or 'vue-yjs-demo-messages'

ydoc = Doc()
yarray = ydoc.get("conversation1", type=Array);
first_run = True


async def user_input():
    while True:
        loop = asyncio.get_event_loop()
        content = await loop.run_in_executor(None, input, "> ")
        if len(content.strip()) > 0:
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

# def handle_deep_changes(events):
#     print(events)
#     # print("to_py\n", yarray.to_py())


#     for event in events:
#         print("\n-" , event.delta[0]["insert"][-1].to_py())
#         # for item in event.delta[0]["insert"]:
#         #     print("item", item.to_py())        
#     print("\nUser:")


def handle_deep_changes(events: list[ArrayEvent]):
    # last = yarray.to_py()
    # print(last)
# process the events

    # print("to_py\n", yarray.to_py()) 
    # print("first_run\n", first_run)
    # try:
 
    #     if first_run :
    #         print("first\n", yarray.to_py())
    #         first_run = False
    #     else:
    #         print("OTHER\n", yarray.to_py())

    
    # except Exception as error:
    # # handle the exception
    #     print("An exception occurred:", error) 
    # try:
    #     for event in events:
    #         print("\n-",event.delta[0]["insert"][-1].to_py())
    # except:
    #     pass


    try:
        cpt = 0
        # print(events)
        for event in events:
            # print("\nDELTA\n", event.delta)
            for delta in event.delta:
                if "insert" in delta:
                    for item in delta["insert"]:
                        message = item.to_py()
                        # print("item", message)
                       
                        print (f"{message['username']} : {message['text']}")
                # print("\n----DELTA\n", delta)

            # for key, value in event.delta:
            #     print(key, value)
            # print("\insert\n", event.delta[0]["insert"])
            # for item in event.delta[0]["insert"]:
            #     print("item", item.to_py())
            # print("\n-",cpt, event)
            # print("\ndelta\n", event.delta)
            # insert = event.delta[0]["insert"] if event.delta[0]["insert"] else event.delta[1]["insert"] 
            # print("\ninsert\n", insert)
            # if first_run == True:
            #     print("first\n", yarray.to_py())
            #     first_run = False
            # else:
            #     print("OTHER\n", yarray.to_py())
    except Exception as error:
        # handle the exception
        print("An exception occurred:", error) 
    
    # cpt =0
    # for event in events:
    #     print("\n-",cpt, event)
    #     cpt +=1
    #     print("\ndelta\n", event.delta)
    #     print("\npath\n", event.path)
    #     print("\insert\n", event.delta[0]["insert"])
    #     for item in event.delta[0]["insert"]:
    #         print("item", item.to_py())
        # print("\ninsert to_py\n", event.delta[0]["insert"])

async def client():

    async with (
        aconnect_ws(f"{sync_url}/{sync_room}") as websocket,
        WebsocketProvider(ydoc, HttpxWebsocket(websocket, sync_room)),
    ):
        # first_run = True
        array0_subscription_id = yarray.observe_deep(handle_deep_changes)
        
        await asyncio.Future()  # run forever
    

# asyncio.run(client())
async def main():
    tasks = [user_input(), client()]
    await asyncio.gather(*tasks)


loop = asyncio.get_event_loop()
loop.run_until_complete(main())
loop.close()