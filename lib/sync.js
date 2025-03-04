import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { v4 as uuidV4 } from "uuid";
import chalk from "chalk";

export class Sync {
  constructor(options) {
    this.options = options;
    // console.log("options", this.options);
    if (this.options.promptUser != undefined) {
      this.init_user();
    } else {
      this.init_ai();
    }
  }
  init_ai() {
    let module = this;
    this.ydoc = new Y.Doc();
    this.provider = new WebsocketProvider(
      this.options.url,
      this.options.room,
      this.ydoc
    );

    this.yarray = this.ydoc.getArray("conversation1");
    this.yarray.observeDeep((yarrayEvent) => {
      module.logMessages();
    });

    this.provider.on("status", (event) => {
      console.log("Connection status:", event.status);
    });

    this.provider.on("sync", (isSynced) => {
      if (isSynced) {
        let  messages = this.yarray.toJSON();
        console.log("Synced");
        this.options.onInit(messages);
      }
    });


  }
  init_user() {
    let module = this;
    this.ydoc = new Y.Doc();
    this.provider = new WebsocketProvider(
      this.options.url,
      this.options.room,
      this.ydoc
    );
    this.provider.on("status", (event) => {
      console.log("Connection status:", event.status);
    });

    this.provider.on("sync", (isSynced) => {
      if (isSynced) {
        console.log("Synced");
        this.options.promptUser();
      }
    });

    this.yarray = this.ydoc.getArray("conversation1");
    this.yarray.observeDeep((yarrayEvent) => {
      module.logMessages();
    });
  }

  addMessage(m) {
    const message = new Y.Map();
    message.set("clientID", this.ydoc.clientID);
    message.set("id", uuidV4());
    message.set("username", this.options.username);
    message.set("action", "chat");
    message.set("text", m.text);
    message.set("role", this.options.role);
    if (m.target != undefined) message.set("target", m.target);
    message.set("timestamp", Date.now());
    this.ydoc.transact(() => {
      this.yarray.push([message]);
    });
  }
  logMessages() {
    let last_message = this.yarray.get(this.yarray.length - 1);
    // todo just le dernier message
    if (this.options.promptUser != undefined) {
      this.yarray.forEach((message, index) => {
        if (this.options.debug == undefined || this.options.debug == 0) {
          let last;
          let line = ""
          if(message.get("role") == "ai"){
            line = chalk.yellow("[" + message.get("username") + "]")
          }else{
            line = chalk.green("[" + message.get("username") + "]")
          }
          if(message.get("target") != undefined){
            line += chalk.cyan("@" + message.get("target")) 
          }
          line +=  " : "+message.get("text");
          console.log(line);
        //   console.log(chalk.yellow("Loading model..."));
        } else {
          console.log("message", message.toJSON());
        }
      });
    } else {
      let ai_data = {
        id: last_message.get("id"),
        username: last_message.get("username"),
        timestamp: last_message.get("timestamp"),
        clientID: last_message.get("clientID"),
        text: last_message.get("text"),
        role: last_message.get("role"),
      };
      this.options.onMessage(ai_data);
    }
  }
  setUsername(n) {
    console.log("username", n);
    this.options.username = n;
  }
}
