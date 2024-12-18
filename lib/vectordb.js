import * as lancedb from "@lancedb/lancedb";
import * as arrow from "apache-arrow";
import { Embedder } from "./embedder.js";

let careful_reset_db = true;

let embedder = new Embedder();
// console.log("arrow", arrow)
const schema = new arrow.Schema([
  // new arrow.Field("vector", new Array()),
  // new arrow.Field("price", new arrow.Int32()),
  // new arrow.Field("item", new arrow.Utf8()),

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
    if (careful_reset_db == true && tableNames.includes("messages_table")) {
      console.log("nettoyage for dev");
      await this.db.dropTable("messages_table");
    }
    tableNames = await this.db.tableNames();
    console.log(tableNames);
    if (tableNames.includes("messages_table")) {
      console.log("messages_table already exists");
      this._messages_table = await this.db.openTable("messages_table");
    } else {
      this._messages_table = await this.db.createEmptyTable(
        "messages_table",
        schema
      );
      await this._messages_table.createIndex("text", {
        config: lancedb.Index.fts(),
      });
      console.log("creating messages_table already exists");
    }

    // const data = [
    //     { /*vector: [3.1, 4.1],*/ text: "Frodo was a happy puppy" },
    //     { /*vector: [5.9, 26.5],*/ text: "There are several kittens playing" },
    //     ];
    //     const tbl = await this.db.createTable("my_table", data, { mode: "overwrite" });
    //     await tbl.createIndex("text", {
    //         config: lancedb.Index.fts(),
    //     });

    //     let res =await tbl
    //         .search("puppet"/*, queryType="fts"*/)
    //         .select(["text"])
    //         .limit(10)
    //         .toArray();
    //     console.log(res)
  }

  async addMessage(message) {
    let embedding = await embedder.getEmbedding(message.text);
    // console.log("vector", embedding.vector)
    let mess = {
      vector: embedding.vector,
      id: message.id,
      username: message.username,
      text: message.text,
    };
    console.log("mess", mess.vector[0])
    // await this._messages_table.add(message);
    // const data = [
    //     { /*vector: [1.3, 1.4],*/ item: "fizz", price: 100.0 },
    //     { /*vector: [9.5, 56.2],*/ item: "buzz", price: 200.0 },
    //   ];
    let res = await this._messages_table.add([mess]);

    console.log("res", res);
    //  const res = await this._messages_table.search([100, 100]).limit(2).toArray();
    //  console.log("res", res)
  }

  async search(query) {
    console.log("query", query);
    let result = await this._messages_table
      .search(query)
      .select(["text", "username"])
      .limit(10)
      .toArray();

if(result.length>0 && result[0]._score<0){
  console.log("reindex", result)
      await this._messages_table.createIndex("text", {
        config: lancedb.Index.fts(),
      });
    }

      return result
  }
  async delete(id) {
    await this._messages_table.delete('item = "' + id + '"');
  }
}
