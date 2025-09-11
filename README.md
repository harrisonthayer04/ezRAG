# **ezRAG**
### ezRAG is a simple web app designed to allow users to upload documents (.txt, .md, and .pdf), and prompt their choice of LLM to answer questions using said documents.
### Currently the web app is under development, and the current iteration only supports uploading your files, as well as uploading your openrouter api key and prompting gpt-5 via the openrouter api. The current version also supports querying the model.

#### Big limitation to note: Currently only .txt and .md files can be used to upload non-english text, however currently cross language support is questionable. ezRAG has only been tested on english text.

### Features on the horizon: 
1. User defined chunking parameters
2. Revamped interaction with the models (chat mode)
3. Model selector
4. More metrics such as vectorization time, model cost etc