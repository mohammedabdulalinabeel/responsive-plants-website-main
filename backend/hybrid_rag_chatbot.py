import mysql.connector
from langchain_core.documents import Document
from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_ollama import OllamaEmbeddings
from langchain_ollama import OllamaLLM
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser


# -----------------------------
# 1. PATH TO YOUR MD FILES
# -----------------------------
MD_PATH = r"C:\Users\Mohammed Abdul Ali\OneDrive\Desktop\ai chatbot\responsive-plants-website-main (2)\responsive-plants-website-main\crop_md"


# -----------------------------
# 2. MYSQL CONFIG
# -----------------------------
MYSQL_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "QLd371@j_yl",
    "database": "farming_chatbot"
}


# -----------------------------
# 3. LOAD MD FILES
# -----------------------------
print("📂 Loading MD files...")
md_loader = DirectoryLoader(MD_PATH, glob="**/*.md", loader_cls=TextLoader)
md_docs = md_loader.load()
print(f"✅ Loaded {len(md_docs)} MD documents")


# -----------------------------
# 4. LOAD MYSQL crop_guide
# -----------------------------
print("🛢 Loading crop_guide table from MySQL...")
conn = mysql.connector.connect(**MYSQL_CONFIG)
cursor = conn.cursor()

cursor.execute("SELECT * FROM crop_guide")
rows = cursor.fetchall()
columns = [desc[0] for desc in cursor.description]

crop_docs = []
for row in rows:
    content = "CROP GUIDE DATA:\n"
    for col, val in zip(columns, row):
        content += f"{col}: {val}\n"

    crop_docs.append(Document(page_content=content, metadata={"source": "crop_guide"}))

print(f"✅ Loaded {len(crop_docs)} crop_guide records")


# -----------------------------
# 5. LOAD MYSQL pest_diseases
# -----------------------------
print("🦠 Loading pest_diseases table from MySQL...")
cursor.execute("SELECT * FROM pest_diseases")
rows = cursor.fetchall()
columns = [desc[0] for desc in cursor.description]

pest_docs = []
for row in rows:
    content = "PEST / DISEASE DATA:\n"
    for col, val in zip(columns, row):
        content += f"{col}: {val}\n"

    pest_docs.append(Document(page_content=content, metadata={"source": "pest_diseases"}))

print(f"✅ Loaded {len(pest_docs)} pest_diseases records")

cursor.close()
conn.close()


# -----------------------------
# 6. COMBINE ALL DOCUMENTS
# -----------------------------
all_docs = md_docs + crop_docs + pest_docs
print(f"\n📌 Total documents combined: {len(all_docs)}")


# -----------------------------
# 7. SPLIT INTO CHUNKS
# -----------------------------
print("\n✂️ Splitting into chunks...")
text_splitter = RecursiveCharacterTextSplitter(chunk_size=900, chunk_overlap=150)
chunks = text_splitter.split_documents(all_docs)

print(f"✅ Total chunks created: {len(chunks)}")


# -----------------------------
# 8. EMBEDDINGS + VECTOR DB
# -----------------------------
print("\n🧠 Creating embeddings + Chroma vector database...")
embeddings = OllamaEmbeddings(model="llama3")

db = Chroma.from_documents(
    chunks,
    embeddings,
    persist_directory="chroma_db_hybrid"
)

db.persist()
print("✅ Vector DB created successfully!")


# -----------------------------
# 9. LOAD LLAMA3 MODEL
# -----------------------------
llm = OllamaLLM(model="llama3")


# -----------------------------
# 10. CREATE RAG QA CHAIN
# -----------------------------
prompt = ChatPromptTemplate.from_template(
    "Use the following context to answer the question about farming and crops. "
    "If you don't know the answer, say you don't know.\n\n"
    "Context: {context}\n\n"
    "Question: {question}"
)

qa = (
    {"context": db.as_retriever(search_kwargs={"k": 4}), "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)


# -----------------------------
# 11. CHAT LOOP
# -----------------------------
print("\n🌾✅ Hybrid RAG Farming Chatbot Ready!")
print("Type 'exit' to stop.\n")

while True:
    query = input("You: ")

    if query.lower() == "exit":
        break

    response = qa.invoke(query)
    print("\nBot:", response, "\n")