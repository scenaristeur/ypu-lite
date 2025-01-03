# connect to good musik

https://www.radiofrance.fr/fip/radio-groove

# run multiuser chat
in 4 different terminals

- run the provider 
```
HOST=localhost PORT=1234 npx y-websocket

```
- run the agent
- llama 3.2 https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/MODEL_CARD.md

first download the model from (!!! point ou tiret !!! ) https://huggingface.co/bartowski/Llama-3.2-1B-Instruct-GGUF/tree/mainwith  https://huggingface.co/bartowski/Llama-3.2-1B-Instruct-GGUF/resolve/main/Llama-3.2-1B-Instruct-Q4_K_M.gguf?download=true and store it in `./models/` folder or here https://huggingface.co/ThomasBaruzier/Llama-3.2-1B-Instruct-GGUF/tree/main 


> debug sans rag 
`NODE_DEBUG=cluster,net,http,fs,tls,module,timers node "agents copy 3.js" `

```
npm run agent
or create your agent in ./ai_personas/

or npm run agent Grenouille
or npm run agent BotanikAi

```

- run conversation
```
npm run conv BotanikAi
```



- run 2 or more users

 
```bash
npm run dev John
# or 
npm run dev Jane
```

# YJS provider
https://docs.yjs.dev/ecosystem/connection-provider/y-websocket

# multiple users
in multiple terminals open ```npm run dev```
- see grammar https://node-llama-cpp.withcat.ai/guide/#chatbot-with-json-schema

# voice 
- https://github.com/ictnlp/LLaMA-Omni
- https://medium.com/@mahendra0203/ears-for-ai-making-llama-listen-and-learn-c506ac72da39

# embedding & VEctorDB
- https://lancedb.github.io/lancedb/basic/#using-the-embedding-api
- get this embedding model https://huggingface.co/CompendiumLabs/bge-small-en-v1.5-gguf/blob/main/bge-small-en-v1.5-q8_0.gguf into your ./models folder
- french embedding model https://www.reddit.com/r/LocalLLaMA/comments/1e5bz9d/seeking_recommendations_for_multilanguage/?rdt=51514
- french embedding : nomic https://huggingface.co/nomic-ai/nomic-embed-text-v1.5-GGUF/tree/main
- https://neon.tech/blog/building-a-rag-application-with-llama-3-1-and-pgvector

# multi speaker
- https://huggingface.co/spaces/shivammehta25/Matcha-TTS

# interessant 
article anthorpic Agent ou workflow ?
- https://www.anthropic.com/research/building-effective-agents
- https://github.com/modelcontextprotocol/servers/tree/main/src/memory
- https://github.com/modelcontextprotocol/servers/blob/main/src/memory/index.ts

# ModelContextProtocol
- https://github.com/modelcontextprotocol/servers
- https://github.com/modelcontextprotocol
- client https://modelcontextprotocol.io/quickstart/client
- ts client https://github.com/modelcontextprotocol/typescript-sdk