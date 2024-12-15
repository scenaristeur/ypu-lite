import 'dotenv/config'
import readline from 'readline'
import { Sync } from './lib/sync.js'

let sync_options = {
  url: process.env.SYNC_URL,
  room: process.env.SYNC_ROOM,
  role: "human-cli",
  debug: process.env.SYNC_DEBUG,
}
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function promptUser() {
  rl.question('Enter text to update (or "quit" to exit): \n', (input) => {
    if (input.toLowerCase() === 'quit') {
      rl.close()
      sync.provider.disconnect()
      process.exit(0)
    } else {
      if(input.length>0) {
        sync.addMessage({text: input})
      }
      promptUser()
    }
  })
}

sync_options.promptUser = promptUser
let sync = new Sync(sync_options)

