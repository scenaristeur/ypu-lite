import * as lancedb from "@lancedb/lancedb";
import * as arrow from "apache-arrow";
// import "@lancedb/lancedb/embedding/openai";
// import { LanceSchema, getRegistry, register } from "@lancedb/lancedb/embedding";
// import { EmbeddingFunction } from "@lancedb/lancedb/embedding";
// import { type Float, Float32, Utf8 } from "apache-arrow";

const schema = new arrow.Schema([
  new arrow.Field("id", new arrow.Utf8()),
  new arrow.Field("username", new arrow.Utf8()),
  new arrow.Field("text", new arrow.Utf8()),
]);

export class VectorDb {
  constructor(options) {
    this.databaseDir = options.databaseDir || "./database";
    this.init();
  }

  async init() {
    this.db = await lancedb.connect(this.databaseDir);
    let tableNames = await this.db.tableNames();
    if (tableNames.includes("messages_table")) {
        console.log("nettoyage for dev")
    await this.db.dropTable("messages_table");
    }
     tableNames = await this.db.tableNames();
    console.log(tableNames);
    if (tableNames.includes("messages_table")) {
        console.log("messages_table already exists")
      this._messages_table = await this.db.openTable("messages_table");
    } else {
      this._messages_table = await this.db.createEmptyTable(
        "messages_table",
        schema
      );
      console.log("creating messages_table already exists")
    }
  }

  async addMessage(message) {
    await this._messages_table.add(message);
  }

  async search(query) {
    return await this._messages_table.search(query).limit(2).toArray();
  }
  async delete(id) {
    await this._messages_table.delete('item = "' + id + '"');
  }
}
