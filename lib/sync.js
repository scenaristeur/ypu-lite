import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { v4 as uuidV4 } from "uuid";

export class Sync {
  constructor(options) {
    this.options = options;
    this.init();
  }
  init() {
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
        // console.log("Initial content:", module.logMessages());
        this.options.promptUser();
      }
    });

    this.yarray = this.ydoc.getArray("conversation1");
    this.yarray.observeDeep((yarrayEvent) => {
    //   console.log("change");
      module.logMessages();
    });
  }

  addMessage(options) {
    // console.log("addMessage", options);
    const message = new Y.Map();

    message.set("speaker", this.ydoc.clientID);
    message.set("id", uuidV4());
    message.set("action", "chat");
    message.set("text", options.text);
    message.set("role", "human-cli");
    message.set("timestamp", Date.now());
    // console.log("message", message)
    this.ydoc.transact(() => {
    //   console.log("push");
      // yarray.delete(0, yarray.length)
      this.yarray.push([message]);
    });
    // console.log("yarray updated.");
  }
  logMessages() {
    this.yarray.forEach((message, index) => {
      if (this.options.debug == undefined || this.options.debug == 0) {
        let line = "["+message.get("speaker") + "]: " + message.get("text");
        console.log(line);
      }else {
        console.log("message", message.toJSON());
      } 
    });
  }
}
