import mysql.connector
import re
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import OllamaEmbeddings

MYSQL_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "QLd371@j_yl",   
    "database": "farming_chatbot"
}

# -----------------------------
# Load crop names from MySQL
# -----------------------------
conn = mysql.connector.connect(**MYSQL_CONFIG)
cursor = conn.cursor()
cursor.execute("SELECT crop_name FROM crop_guide")
crops = [row[0] for row in cursor.fetchall()]
cursor.close()
conn.close()

print(f"\nTotal crops found in MySQL: {len(crops)}\n")

# -----------------------------
# Load Chroma DB
# -----------------------------
embeddings = OllamaEmbeddings(model="llama3")
db = Chroma(persist_directory="chroma_db_hybrid", embedding_function=embeddings)
retriever = db.as_retriever(search_kwargs={"k": 10})


def clean_crop_name(crop):
    # Take only the main crop word before "("
    base = crop.split("(")[0].strip()
    return base.lower()


def check_retrieval(crop, query):
    docs = retriever.invoke(query)
    crop_key = clean_crop_name(crop)

    for d in docs:
        text = d.page_content.lower()

        # Check crop keyword exists anywhere in retrieved text
        if crop_key in text:
            return True

        # Also check "crop_name:" pattern
        if re.search(rf"crop_name\s*:\s*{re.escape(crop_key)}", text):
            return True

    return False


# -----------------------------
# Test for each crop
# -----------------------------
for crop in crops:
    soil_query = f"What is the soil type for {crop}?"
    irrigation_query = f"What is the irrigation method and irrigation frequency for {crop}?"
    fertilizer_query = f"What is the fertilizer schedule and NPK recommendation for {crop}?"
    season_query = f"What is the season and climate requirement for {crop}?"

    soil_ok = check_retrieval(crop, soil_query)
    irrigation_ok = check_retrieval(crop, irrigation_query)
    fertilizer_ok = check_retrieval(crop, fertilizer_query)
    season_ok = check_retrieval(crop, season_query)

    print(f"\n🌾 CROP: {crop}")
    print(f"   Soil:       {'✅ FOUND' if soil_ok else '❌ NOT FOUND'}")
    print(f"   Irrigation: {'✅ FOUND' if irrigation_ok else '❌ NOT FOUND'}")
    print(f"   Fertilizer: {'✅ FOUND' if fertilizer_ok else '❌ NOT FOUND'}")
    print(f"   Season:     {'✅ FOUND' if season_ok else '❌ NOT FOUND'}")

print("\n✅ Testing completed.\n")