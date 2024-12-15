import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import readline from 'readline'

const ydoc = new Y.Doc()
// const provider = new WebsocketProvider('wss://ypu.glitch.me/', 'vue-yjs-demo', ydoc)
const provider = new WebsocketProvider('ws://localhost:1234', 'vue-yjs-demo-messages', ydoc)
// const ytext = ydoc.getText('shared')
const yarray = ydoc.getArray('conversation1') 

provider.on('status', event => {
  console.log('Connection status:', event.status)
})

// ytext.observe(event => {
//   console.log('Received update. Current text:', ytext.toString())
// })
yarray.observeDeep(yarrayEvent => {
  yarrayEvent.target === yarray // => true

  // Find out what changed: 
  // Log the Array-Delta Format to calculate the difference to the last observe-event
  // console.log("delta", yarrayEvent.changes.delta)
  // yarray.forEach((message, index) => {
  //   console.log("message", message.toJSON())
  // })
  // console.log("messages",yarray.toJSON())

  logMessages()
})

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function promptUser() {
  rl.question('Enter text to update (or "quit" to exit): ', (input) => {
    if (input.toLowerCase() === 'quit') {
      rl.close()
      provider.disconnect()
      process.exit(0)
    } else {
      const message = new Y.Map()
      message.set('text', input)
      message.set('speaker', ydoc.clientID)
      message.set('role', 'human-cli')
      // console.log("message", message)
       ydoc.transact(() => {
        // yarray.delete(0, yarray.length)
        yarray.push( [message])
       })
      console.log('yarray updated.')
      promptUser()
    }
  })
}
function logMessages() {
  yarray.forEach((message, index) => {
    console.log("message", message.toJSON())
  })
}

provider.on('sync', (isSynced) => {
  if (isSynced) {
    console.log('Initial content:', logMessages())
    promptUser()
  }
})
