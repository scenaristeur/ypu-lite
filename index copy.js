import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import readline from 'readline'

const ydoc = new Y.Doc()
const provider = new WebsocketProvider('wss://ypu.glitch.me/', 'vue-yjs-demo', ydoc)
const ytext = ydoc.getText('shared')

provider.on('status', event => {
  console.log('Connection status:', event.status)
})

ytext.observe(event => {
  console.log('Received update. Current text:', ytext.toString())
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
      ydoc.transact(() => {
        ytext.delete(0, ytext.length)
        ytext.insert(0, input)
      })
      console.log('Text updated.')
      promptUser()
    }
  })
}

provider.on('sync', (isSynced) => {
  if (isSynced) {
    console.log('Initial content:', ytext.toString())
    promptUser()
  }
})
