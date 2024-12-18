import { fileURLToPath } from "url";
import path from "path";
import { getLlama, LlamaEmbedding } from "node-llama-cpp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const modelPath = path.join(__dirname, "models", "bge-small-en-v1.5-q8_0.gguf");

const llama = await getLlama();
const model = await llama.loadModel({ modelPath });
const context = await model.createEmbeddingContext();

async function embedDocuments(documents) {
  const embeddings = new Map();

  await Promise.all(
    documents.map(async (document) => {
      const embedding = await context.getEmbeddingFor(document);
      embeddings.set(document, embedding);

      console.debug(
        `${embeddings.size}/${documents.length} documents embedded`
      );
    })
  );

  return embeddings;
}

function findSimilarDocuments(embedding, documentEmbeddings) {
  const similarities = new Map();
  for (const [otherDocument, otherDocumentEmbedding] of documentEmbeddings)
    similarities.set(
      otherDocument,
      embedding.calculateCosineSimilarity(otherDocumentEmbedding)
    );

  return Array.from(similarities.keys()).sort(
    (a, b) => similarities.get(b) - similarities.get(a)
  );
}

const documentEmbeddings = await embedDocuments([
  "The sky is clear and blue today",
  "I love eating pizza with extra cheese",
  "Dogs love to play fetch with their owners",
  "The capital of France is Paris",
  "Drinking water is important for staying hydrated",
  "Mount Everest is the tallest mountain in the world",
  "A warm cup of tea is perfect for a cold winter day",
  "Painting is a form of creative expression",
  "Not all the things that shine are made of gold",
  "Cleaning the house is a good way to keep it tidy",
]);

const query = "What is the tallest mountain on Earth?";
const queryEmbedding = await context.getEmbeddingFor(query);

const similarDocuments = findSimilarDocuments(
  queryEmbedding,
  documentEmbeddings
);
const topSimilarDocument = similarDocuments[0];

console.log("query:", query);
console.log("Document:", topSimilarDocument);

const text = "Hello world";
console.log("Text:", text);

const embedding = await context.getEmbeddingFor(text);
console.log("Embedding vector:", embedding.vector);
