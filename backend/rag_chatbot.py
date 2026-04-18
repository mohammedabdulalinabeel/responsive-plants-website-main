import os
from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import OllamaEmbeddings
from langchain_community.llms import Ollama
from langchain.chains import RetrievalQA

# 1. Path to your MD folder
DATA_PATH = r"C:\Users\Mohammed Abdul Ali\OneDrive\Desktop\ai chatbot\responsive-plants-website-main (2)\responsive-plants-website-main\crop_md"

# 2. Load all MD files
loader = DirectoryLoader(DATA_PATH, glob="**/*.md", loader_cls=TextLoader)
documents = loader.load()

print(f"Loaded {len(documents)} documents")

# 3. Split into chunks
text_splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=100)
texts = text_splitter.split_documents(documents)

print(f"Split into {len(texts)} chunks")

# 4. Create embeddings using Ollama
embeddings = OllamaEmbeddings(model="llama3")

# 5. Store in Chroma DB (local vector database)
db = Chroma.from_documents(texts, embeddings, persist_directory="chroma_db")
db.persist()

print("Vector DB created successfully!")

# 6. Load Llama3 model
llm = Ollama(model="llama3")

# 7. Create RAG chain
qa = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=db.as_retriever(search_kwargs={"k": 3})
)

# 8. Chat Loop
print("\n✅ RAG Farming Chatbot is Ready!")
print("Type 'exit' to stop.\n")

while True:
    query = input("You: ")
    if query.lower() == "exit":
        break

    response = qa.run(query)
    print("\nBot:", response, "\n")