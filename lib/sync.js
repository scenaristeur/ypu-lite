import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { v4 as uuidV4 } from "uuid";

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
    this.provider.on("status", (event) => {
      console.log("Connection status:", event.status);
    });

    this.provider.on("sync", (isSynced) => {
      if (isSynced) {
        console.log("Synced");
        // this.options.promptUser();
      }
    });

    this.yarray = this.ydoc.getArray("conversation1");
    this.yarray.observeDeep((yarrayEvent) => {
      module.logMessages();
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
    message.set("speaker", this.ydoc.clientID);
    message.set("id", uuidV4());
    message.set("username", this.options.username);
    message.set("action", "chat");
    message.set("text", m.text);
    message.set("role", this.options.role);
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
          let line = "[" + message.get("speaker") + "]: " + message.get("text");
          console.log(line);
        } else {
          console.log("message", message.toJSON());
        }
      });
    } else {
      console.log("ai");
      let ai_data = {
        id: last_message.get("id"),
        username: last_message.get("username"),
        timestamp: last_message.get("timestamp"),
        speaker: last_message.get("speaker"),
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
