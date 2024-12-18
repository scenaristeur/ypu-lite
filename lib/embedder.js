import { fileURLToPath } from "url";
import path from "path";
import { getLlama, LlamaEmbedding } from "node-llama-cpp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// const modelPath = path.join(__dirname, "..", "models", "bge-small-en-v1.5-q8_0.gguf");
const modelPath = path.join(__dirname, "..", "models", "nomic-embed-text-v1.5.Q4_K_M.gguf");

const llama = await getLlama();
const model = await llama.loadModel({ modelPath });
const context = await model.createEmbeddingContext();


export class Embedder {
    constructor(parameters) {
        
    }
    async getEmbedding(text) {
        return await context.getEmbeddingFor(text);
    }
}