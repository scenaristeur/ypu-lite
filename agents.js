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

const systemPrompt =
  "Tu participes à une conversation entre plusieurs utilisateurs. Tu es là pour les aider à résoudre leurs problèmes.";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const modelsDirectory = path.join(__dirname, "..", "models");

const llama = await getLlama();

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
  chatWrapper: new MyCustomChatWrapper()
});
console.log(session)
console.log();

const onMessage = async function (m) {
  if (m.role != "ai") {
    console.log(chalk.yellow("AI: "));
    console.log(m);
    const response = await session.prompt(
      "speaker:" + m.username + "\n" + "text:" + m.text
    );
    console.log(chalk.yellow("AI response: ") + response);
    console.log();
    sync.addMessage({ text: response });
  }
};
sync_options.onMessage = onMessage;
let sync = new Sync(sync_options);
sync.setUsername("ai");
