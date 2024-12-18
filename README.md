# connect to good musik

https://www.radiofrance.fr/fip/radio-groove

# run multiuser chat
in 4 different terminals

- run the provider 
```
HOST=localhost PORT=1234 npx y-websocket

```
- run the agent
```
npm run agent
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