import { fileURLToPath } from "url";
import path from "path";
import chalk from "chalk";
import { getLlama, LlamaChatSession, resolveModelFile } from "node-llama-cpp";
import { MyCustomChatWrapper } from "./MyCustomChatWrapper.js";

import "dotenv/config";
import { Sync } from "./lib/sync.js";
let sync_options = {
  url: process.env.SYNC_URL,
  room: process.env.SYNC_ROOM,
  role: "ai",
  debug: process.env.SYNC_DEBUG,
};

const systemPrompt = `Tu participes à une conversation entre plusieurs utilisateurs.
  Dans le message qu'il envoie, chaque utilisateur est identifié par une balise <speaker>{{username}}</speaker>.
  Tu ne dois utiliser ces balises que pour savoir qui a parlé.
  Tu ne dois pas faire apparaitre ces balises dans tes réponses.
  `;

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
    const response = await session.prompt(
      "<speaker>" + m.username + "</speaker>" + m.text,
      { grammar }
    );
    console.log(chalk.yellow("AI response: ") + response);
    console.log();
    // console.log(response)
    const parsedRes = grammar.parse(response);
    let message = { text: parsedRes.response, target: parsedRes.speaker }
    sync.addMessage(message);
      const initialChatHistory = session.getChatHistory();
  console.log(initialChatHistory);
  }

};

const onInit  = function (data) {
  console.log("should be Initialized with "/*, data*/);
//   let chatHistory = session.getChatHistory();
//   console.log("chatHistory", chatHistory);
//   for (let m of data){
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
//   session.setChatHistory(chatHistory);
//   console.log("chatHistory", chatHistory);
};


sync_options.onMessage = onMessage;
sync_options.onInit = onInit;
let sync = new Sync(sync_options);
sync.setUsername("ai");
