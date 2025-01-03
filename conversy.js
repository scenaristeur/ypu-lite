import { fileURLToPath } from "url";
import path from "path";
import chalk from "chalk";
import { getLlama, LlamaChatSession, resolveModelFile } from "node-llama-cpp";
import { readFile } from "fs/promises";
import "dotenv/config";
import { Sync } from "./lib/sync.js";

import minimist from "minimist";

// options de synchronisation dans .env
let sync_options = {
  url: process.env.SYNC_URL,
  room: process.env.SYNC_ROOM,
  role: "ai",
  debug: process.env.SYNC_DEBUG,
};

// recupération des arguments de la ligne de commande , ex : npm run agent Grenouille
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

// let systemPrompt = `Tu participes à une conversation entre plusieurs utilisateurs.
//   Dans le message qu'il envoie, chaque utilisateur est identifié par une balise <speaker>{{username}}</speaker>.
//   Tu ne dois utiliser ces balises que pour savoir qui a parlé.
//   Tu ne dois pas faire apparaitre ces balises dans tes réponses.
//   `;

// let systemPrompt = `You are a helpful, respectful and honest assistant. Always answer as helpfully as possible.
// If a question does not make any sense, or is not factually coherent, explain why instead of answering something incorrectly.
// If you don't know the answer to a question, don't share false information.`;
let systemPrompt = `Tu es un assistant utile, respectueux et honnête. Réponds toujours de manière aussi utile que possible.
Si une question n'a pas de sens, ou n'est pas factuellement cohérente, explique pourquoi au lieu de donner une réponse incorrecte.
Si tu ne connais pas la réponse à une question, ne partage pas de fausses informations.`;

if (ai_persona && ai_persona.systemPrompt) {
  systemPrompt += ai_persona.systemPrompt;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const modelsDirectory = path.join(__dirname, "..", "models");

const llama = await getLlama();
const modelPath = path.join(
  __dirname,
  "models",
  "Llama-3.2-1B-Instruct.Q4_K_M.gguf"
);

console.log(chalk.yellow("Resolving model file...", modelPath));

console.log(chalk.yellow("Loading model..."));
const model = await llama.loadModel({ modelPath });

console.log(chalk.yellow("Creating context..."));
const context = await model.createContext();

// console.log(chalk.yellow("Creating session...", systemPrompt));
const session = new LlamaChatSession({
  contextSequence: context.getSequence(),
    systemPrompt: systemPrompt,
  //   chatWrapper: new MyCustomChatWrapper(),
});
// console.log(session);

const onMessage = async function (m) {
  console.log(m);
  if( m.clientID == sync.ydoc.clientID){
      return
  }
  let response = await session.prompt(m.text);
  console.log("response", response);
  let message = { text: response, target: m.username };
  sync.addMessage(message);

};

const onInit = function (data) {
  console.log("should be Initialized with ", data);
};

sync_options.onMessage = onMessage;
sync_options.onInit = onInit;
let sync = new Sync(sync_options);
sync.setUsername(ai_persona.name ||"ai-conversy");
