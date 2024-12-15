
import readline from 'readline'
import { Sync } from './lib/sync.js'

let sync_options = {
  url: 'ws://localhost:1234',
  room: 'vue-yjs-demo-messages',
  //debug: true
}
let remote_sync_options = {
  url: 'wss://ypu.glitch.me/',
  room: 'vue-yjs-demo-messages'
}
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function promptUser() {
  rl.question('Enter text to update (or "quit" to exit): \n', (input) => {
    if (input.toLowerCase() === 'quit') {
      rl.close()
      provider.disconnect()
      process.exit(0)
    } else {
      sync.addMessage({text: input})
      promptUser()
    }
  })
}


sync_options.promptUser = promptUser
let sync = new Sync(sync_options)

