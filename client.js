import "dotenv/config";
import readline from "readline";
import { Sync } from "./lib/sync.js";
import minimist from "minimist";
let args = minimist(process.argv.slice(2));
console.log(args);

let sync = undefined;
let sync_options = {
  url: process.env.SYNC_URL,
  room: process.env.SYNC_ROOM,
  role: "human-cli",
  debug: process.env.SYNC_DEBUG,
};
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let username = args._[0]
if (username) {
  sync_options.promptUser = promptUser;
  sync = new Sync(sync_options);
  sync.setUsername(username);
}else{


rl.question('What is your name ? (or "quit" to exit) \n', (input) => {
  if (input.toLowerCase() === "quit") {
    rl.close();

    process.exit(0);
  } else {
    if (input.length > 0) {
      username = input;
      console.log("username", username);
      sync_options.promptUser = promptUser;
      sync = new Sync(sync_options);
      sync.setUsername(username);
    }
  }
});
}


async function promptUser() {
  rl.question('Enter text to update (or "quit" to exit): \n', (input) => {
    if (input.toLowerCase() === "quit") {
      rl.close();
      sync.provider.disconnect();
      process.exit(0);
    } else {
      if (input.length > 0) {
        sync.addMessage({ text: input });
      }
      promptUser();
    }
  });
}
