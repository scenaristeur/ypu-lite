import asyncio
import sys
import crdt
import aiohttp
import json

# Create a CRDT document
doc = crdt.Doc()

# Create a websocket provider
provider = crdt.WebsocketProvider('wss://ypu.glitch.me/', 'vue-yjs-demo', doc)

# Create a text CRDT shared with the provider
ytext = doc.get('shared', crdt.Text)

# React to connection status events
@provider.on('status')
def on_status(event):
    print('Connection status:', event.status)

# React to updates on the text CRDT
@ytext.on('update')
def on_update(event):
    print('Received update. Current text:', ytext.get())

# React to sync events
@provider.on('sync')
def on_sync(isSynced):
    if isSynced:
        print('Initial content:', ytext.get())
        promptUser()

# Prompt the user for input
async def promptUser():
    async with aiohttp.ClientSession() as session:
        async with session.get('https://ypu.glitch.me/api/v1/contents/vue-yjs-demo/shared.txt') as response:
            if response.status == 200:
                data = await response.text()
                print(data)
            else:
                print('Could not get initial content.')
    while True:
        input = await loop.run_in_executor(None, input, 'Enter text to update (or "quit" to exit): ')
        if input.lower() == 'quit':
            provider.disconnect()
            sys.exit(0)
        else:
            async with aiohttp.ClientSession() as session:
                async with session.put('https://ypu.glitch.me/api/v1/contents/vue-yjs-demo/shared.txt', data=json.dumps({'content': input})) as response:
                    if response.status == 200:
                        print('Text updated.')
                    else:
                        print('Failed to update text.')


# Run the event loop
loop = asyncio.get_event_loop()
try:
    loop.run_until_complete(promptUser())
finally:
    loop.close()

