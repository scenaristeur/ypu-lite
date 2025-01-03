import { fileURLToPath } from "url";
import path from "path";
import chalk from "chalk";
import { getLlama, LlamaChatSession, resolveModelFile } from "node-llama-cpp";
import { MyCustomChatWrapper } from "./MyCustomChatWrapper.js";
import { VectorDb } from "./lib/vectordb.js";
import { readFile } from "fs/promises";

let vectordb = null;

import minimist from "minimist";
let args = minimist(process.argv.slice(2));
console.log(args);

let ai_persona = null;
let ai_name = args._[0];
if (ai_name) {
  console.log("ai_name", ai_name);
  ai_persona = JSON.parse(
    await readFile("./ai_personas/" + ai_name + ".json", "utf8")
  );
  console.log("ai_persona", ai_persona);
}

if (process.env.RAG == true && process.env.RAG != 0) {
  console.log("RAG");
  vectordb = new VectorDb({
    databaseDir: "./database",
  });
} else {
  console.log("no RAG");
}

import "dotenv/config";
import { Sync } from "./lib/sync.js";
let sync_options = {
  url: process.env.SYNC_URL,
  room: process.env.SYNC_ROOM,
  role: "ai",
  debug: process.env.SYNC_DEBUG,
};

let systemPrompt = `Tu participes à une conversation entre plusieurs utilisateurs.
  Dans le message qu'il envoie, chaque utilisateur est identifié par une balise <speaker>{{username}}</speaker>.
  Tu ne dois utiliser ces balises que pour savoir qui a parlé.
  Tu ne dois pas faire apparaitre ces balises dans tes réponses.
  `;
if (ai_persona && ai_persona.systemPrompt) {
  systemPrompt += ai_persona.systemPrompt;
}
// const systemPrompt = `Tu participes à une conversation entre plusieurs utilisateurs.
// Vous jouez à un jeu sur un echiquier marqué A à H et 1 à 8.
// Ta position initiale est A1.
// Chaque utilisateur peut se déplacer de 1 case en ligne droite ou en diagonale.
// Les joueurs jouent chacun leur tour, tu joues en dernier et tu dois attrapper les joueurs en te plaçant sur leur case.
// `;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const modelsDirectory = path.join(__dirname, "..", "models");

const llama = await getLlama();

const grammar = await llama.createGrammarForJsonSchema({
  type: "object",
  properties: {
    // positiveWordsInUserMessage: {
    //   type: "array",
    //   items: {
    //     type: "string",
    //   },
    // },
    // userMessagePositivityScoreFromOneToTen: {
    //   enum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    // },
    response: {
      type: "string",
    },
    // action: {
    //   type: "string",
    // },
    speaker: {
      oneOf: [
        {
          type: "null",
        },
        {
          type: "string",
        },
      ],
    },
  },
});
console.log(chalk.yellow("Resolving model file..."));
// const modelPath = await resolveModelFile(
//     // "hf:mradermacher/Llama-3.2-3B-Instruct-GGUF/Llama-3.2-3B-Instruct.Q4_K_M.gguf",
//     "Llama-3.2-1B-Instruct.Q4_K_M.gguf",
//     modelsDirectory
// );
const modelPath = path.join(
  __dirname,
  "models",
  "Llama-3.2-1B-Instruct.Q4_K_M.gguf"
);

console.log(chalk.yellow("Loading model..."));
const model = await llama.loadModel({ modelPath });

console.log(chalk.yellow("Creating context..."));
const context = await model.createContext();

console.log(chalk.yellow("Creating session...", systemPrompt));
const session = new LlamaChatSession({
  contextSequence: context.getSequence(),
  systemPrompt: systemPrompt,
  chatWrapper: new MyCustomChatWrapper(),
});
// console.log(session)
console.log();

const onMessage = async function (m) {
  if (m.role != "ai") {
    console.log(chalk.yellow("AI: "));
    console.log(m);
    let response = null;

    // let texte = "En utilisant le contexte suivant:\n#Contexte:\n";
    // texte += JSON.stringify(search);
    // texte+= "\n#Repond a ce message:\n<speaker>" + m.username + "</speaker>" + m.text
    if (process.env.RAG == true && process.env.RAG != 0) {
      let search = await vectordb.search(m.text);
      console.log("search", search);
      let texte = vectordb.rag_prompt(m.username, m.text, search);
      vectordb.addMessage({ username: m.username, text: m.text, id: m.id });

      console.log("texte", texte);
      response = await session.prompt(texte, { grammar });
      console.log("response", response);
    } else {
      let text = "<speaker>" + m.username + "</speaker>" + m.text;
      console.log("texte", text);
      response = await session.prompt(text, { grammar });
      console.log("response", response);
    }

    console.log(chalk.yellow("AI response: ") + response);

    // console.log(response)
    const parsedRes = grammar.parse(response);
    let message = { text: parsedRes.response, target: parsedRes.speaker };
    let resp = {
      text: parsedRes.response,
      username: "assistant",
      id: m.id + "-ai",
    };
    if (process.env.RAG == true && process.env.RAG != 0) {
      vectordb.addMessage(resp);
    }
    sync.addMessage(message);
    const initialChatHistory = session.getChatHistory();
    // console.log(initialChatHistory);
  }
};

const onInit = function (data) {
  // console.log("should be Initialized with ", data);

  let chatHistory = session.getChatHistory();
  // console.log("chatHistory", chatHistory);
  for (let m of data) {
    // console.log(m);
    if (m.role == "ai") {
      let response = [];
      let r = { response: m.text, speaker: m.target };
      response.push(JSON.stringify(r));
      chatHistory.push({ type: "model", response: response });
    } else {
      chatHistory.push({
        type: "user",
        text: "<speaker>" + m.username + "</speaker>" + m.text,
      });
    }
  }
  //     let message = {}
  //     if  (m.role == "ai"){
  // message.type="model"
  // message.response= [`{"response": "Ah, tu as 30 ans, c'est intéressant! Qu'est-ce que tu fais pour passer le temps?", "speaker": "John"}`]
  //     }else{
  //       message.type="user"
  //       message.text= "<speaker>" + m.username + "</speaker>" + m.text
  //     }
  //     chatHistory.push(message)
  //   }
  session.setChatHistory(chatHistory);
  // console.log("chatHistory", chatHistory);
};

sync_options.onMessage = onMessage;
sync_options.onInit = onInit;
let sync = new Sync(sync_options);
sync.setUsername(ai_persona && ai_persona.name || "ai");
