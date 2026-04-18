import os
import mysql.connector

from langchain_core.documents import Document
from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import OllamaEmbeddings
from langchain_community.llms import Ollama

from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate


# =========================
# CONFIG
# =========================
MD_PATH = r"C:\Users\Mohammed Abdul Ali\OneDrive\Desktop\ai chatbot\responsive-plants-website-main (2)\responsive-plants-website-main\crop_md"
CHROMA_DIR = "chroma_db_hybrid"

MYSQL_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "QLd371@j_yl",
    "database": "farming_chatbot"
}


# =========================
# GLOBAL SETTINGS
# =========================
show_sources = False
last_answer = ""


embeddings = OllamaEmbeddings(model="llama3")
llm = Ollama(model="llama3")


# =========================
# BUILD VECTOR DB FUNCTION
# =========================
def build_db():
    print("\n📂 Building knowledge base...")

    md_loader = DirectoryLoader(MD_PATH, glob="**/*.md", loader_cls=TextLoader)
    md_docs = md_loader.load()

    conn = mysql.connector.connect(**MYSQL_CONFIG)
    cursor = conn.cursor()

    # crop_guide
    cursor.execute("SELECT * FROM crop_guide")
    crops = cursor.fetchall()

    crop_docs = []

    for row in crops:
        crop = row[1]

        crop_docs.append(Document(
            page_content=f"CROP: {crop}\nTOPIC: Soil\n{row[3]} {row[4]}",
            metadata={"crop": crop, "topic": "soil"}
        ))

        crop_docs.append(Document(
            page_content=f"CROP: {crop}\nTOPIC: Irrigation\n{row[15]} {row[16]}",
            metadata={"crop": crop, "topic": "irrigation"}
        ))

        crop_docs.append(Document(
            page_content=f"CROP: {crop}\nTOPIC: Fertilizer\n{row[18]} {row[19]} {row[20]}",
            metadata={"crop": crop, "topic": "fertilizer"}
        ))

        crop_docs.append(Document(
            page_content=f"CROP: {crop}\nTOPIC: Season\n{row[5]} {row[6]}",
            metadata={"crop": crop, "topic": "season"}
        ))

    cursor.close()
    conn.close()

    all_docs = md_docs + crop_docs

    splitter = RecursiveCharacterTextSplitter(chunk_size=700, chunk_overlap=100)
    chunks = splitter.split_documents(all_docs)

    db = Chroma.from_documents(chunks, embeddings, persist_directory=CHROMA_DIR)

    print("✅ Vector DB created")
    return db


# =========================
# LOAD OR BUILD DB
# =========================
if os.path.exists(CHROMA_DIR):
    print("⚡ Loading existing DB...")
    db = Chroma(persist_directory=CHROMA_DIR, embedding_function=embeddings)
else:
    db = build_db()


retriever = db.as_retriever(search_kwargs={"k": 10})


# =========================
# PROMPT
# =========================
prompt = PromptTemplate(
    input_variables=["context", "question"],
    template="""
You are a farming assistant.

Use ONLY the context below.

If answer not found say: Data not found in my database.

CONTEXT:
{context}

QUESTION:
{question}

ANSWER:
"""
)

qa = RetrievalQA.from_chain_type(
    llm=llm,
    retriever=retriever,
    chain_type="stuff",
    chain_type_kwargs={"prompt": prompt}
)


# =========================
# HELP MENU
# =========================
def help_menu():
    print("""
📌 COMMANDS:
help       → Show commands
exit       → Quit chatbot
rebuild    → Rebuild database
stats      → Show system info
sources on → Show retrieval debug
sources off→ Hide debug
save       → Save last answer
""")


# =========================
# STATS
# =========================
def stats():
    print(f"""
📊 SYSTEM STATS:
- DB Folder: {CHROMA_DIR}
- Retrieval k: 10
- Sources mode: {show_sources}
""")


# =========================
# REBUILD
# =========================
def rebuild():
    global db, retriever, qa

    if os.path.exists(CHROMA_DIR):
        import shutil
        shutil.rmtree(CHROMA_DIR)

    db = build_db()
    retriever = db.as_retriever(search_kwargs={"k": 10})

    qa = RetrievalQA.from_chain_type(
        llm=llm,
        retriever=retriever,
        chain_type="stuff",
        chain_type_kwargs={"prompt": prompt}
    )

    print("🔄 Rebuild complete!")


# =========================
# CHAT LOOP
# =========================
print("\n🌾 Hybrid RAG Chatbot Ready (Production Mode)")
print("Type 'help' for commands\n")

while True:
    q = input("You: ")

    if q.lower() == "exit":
        break

    elif q.lower() == "help":
        help_menu()
        continue

    elif q.lower() == "stats":
        stats()
        continue

    elif q.lower() == "rebuild":
        rebuild()
        continue

    elif q.lower().startswith("sources"):
        if "on" in q:
            show_sources = True
        else:
            show_sources = False
        print(f"Sources mode = {show_sources}")
        continue

    elif q.lower() == "save":
        with open("last_answer.txt", "w", encoding="utf-8") as f:
            f.write(last_answer)
        print("Saved!")
        continue

    result = qa.invoke({"query": q})
    answer = result["result"]
    last_answer = answer

    print("\nBot:", answer, "\n")

    if show_sources:
        docs = retriever.invoke(q)
        print("📌 SOURCES:")
        for d in docs:
            print("-", d.metadata)