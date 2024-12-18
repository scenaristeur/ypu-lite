import * as lancedb from "@lancedb/lancedb";
import * as arrow from "apache-arrow";

const schema = new arrow.Schema([
    new arrow.Field("id", new arrow.Int32()),
    new arrow.Field("name", new arrow.Utf8()),
  ]);
  

export class VectorDb {
  constructor(options) {
    this.databaseDir = options.databaseDir || "./database";
    this.init();
  }

  async init() {
    this.db = await lancedb.connect(this.databaseDir);
    this._messages_table = await this.db.createEmptyTable("messages_table", schema);
      
  }

  async addMessage(message) {
    await this._messages_table.add(message);
  }

  async search(query) {
    return await this._messages_table.search(query).limit(2).toArray();
  }
  async delete(id){
    await this._messages_table.delete('item = "'+id+'"');
  }


}
