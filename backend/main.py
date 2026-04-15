from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from db import get_connection
from md_loader import load_crop_md, load_disease_md

app = FastAPI(title="AI Farming Chatbot Backend")

# -----------------------------
# Enable CORS (Frontend Connection)
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # You can restrict later like ["http://127.0.0.1:5500"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------
# Request Body Model
# -----------------------------
class ChatRequest(BaseModel):
    message: str


# -----------------------------
# Utility Functions
# -----------------------------
def detect_crop_from_message(msg: str):
    msg = msg.lower()

    crop_list = [
        "rice", "paddy", "wheat", "maize", "ragi", "jowar", "bajra",
        "banana", "coconut", "sugarcane", "turmeric", "ginger",
        "tomato", "onion", "chilli", "brinjal", "potato", "cucumber",
        "tapioca", "coffee", "black gram", "green gram", "bengal gram"
    ]

    for crop in crop_list:
        if crop in msg:
            if crop == "paddy":
                return "Rice (Paddy)"
            return crop.title()

    return None


def get_crop_data_from_db(crop_name: str):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    query = "SELECT * FROM crop_guide WHERE crop_name LIKE %s LIMIT 1"
    cursor.execute(query, (f"%{crop_name}%",))

    result = cursor.fetchone()
    conn.close()

    return result


def get_disease_data_from_db(crop_name: str):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    query = "SELECT * FROM pest_diseases WHERE crop_name LIKE %s"
    cursor.execute(query, (f"%{crop_name}%",))

    result = cursor.fetchall()
    conn.close()

    return result


def format_crop_response(crop_data: dict):
    if not crop_data:
        return "❌ No crop data found in database."

    response = f"""
🌱 Crop: {crop_data.get("crop_name")}

📌 Category: {crop_data.get("crop_category")}
🌍 Soil Type: {crop_data.get("soil_type")}
🧪 Soil pH: {crop_data.get("soil_ph")}
🌤️ Climate: {crop_data.get("climate")}
📅 Season: {crop_data.get("season")}
🌡️ Temperature: {crop_data.get("temperature_range")}
🌧️ Rainfall: {crop_data.get("rainfall_requirement")}

🚜 Land Preparation:
{crop_data.get("land_preparation")}

🌾 Seed Rate per Acre:
{crop_data.get("seed_rate_per_acre")}

🌱 Sowing Method:
{crop_data.get("sowing_method")}

📏 Spacing:
{crop_data.get("spacing")}

💧 Irrigation:
Method: {crop_data.get("irrigation_method")}
Frequency: {crop_data.get("irrigation_frequency")}
Critical Stages: {crop_data.get("critical_stages")}

🧪 Fertilizer Recommendation:
{crop_data.get("NPK_recommendation")}

📌 Fertilizer Schedule:
{crop_data.get("fertilizer_schedule")}

🌿 Weed Management:
{crop_data.get("weed_management")}

🐛 Pest Management:
{crop_data.get("pest_management")}

🦠 Disease Management:
{crop_data.get("disease_management")}

⏳ Harvest Time:
{crop_data.get("harvest_time")}

✅ Maturity Signs:
{crop_data.get("maturity_signs")}

📦 Yield per Acre:
{crop_data.get("yield_per_acre")}

🏠 Storage Tips:
{crop_data.get("storage_tips")}
"""
    return response.strip()


def format_disease_response(diseases: list):
    if not diseases:
        return "❌ No disease/pest data found for this crop."

    response = "🦠 Common Diseases / Pests:\n\n"
    for d in diseases:
        response += f"""
🔸 Disease: {d.get("disease_name")}
Symptoms: {d.get("symptoms")}
Cause: {d.get("cause")}
Organic Solution: {d.get("organic_solution")}
Chemical Solution: {d.get("chemical_solution")}
Prevention: {d.get("prevention")}

"""
    return response.strip()


# -----------------------------
# API Endpoints
# -----------------------------
@app.get("/")
def home():
    return {"message": "AI Farming Chatbot Backend Running Successfully!"}


@app.post("/chat")
def chat(req: ChatRequest):
    user_msg = req.message

    crop_name = detect_crop_from_message(user_msg)

    if not crop_name:
        return {
            "reply": "❌ Sorry, I could not detect the crop name. Please mention the crop name (example: rice, tomato, banana)."
        }

    # Fetch crop info from MySQL
    crop_data = get_crop_data_from_db(crop_name)

    # Fetch disease info from MySQL
    disease_data = get_disease_data_from_db(crop_name)

    # Load MD file for extra crop guide
    crop_md = load_crop_md(crop_name)
    extra_info = ""
    if crop_md:
        extra_info = "\n\n📘 Extra Guide (From MD Knowledge Base):\n" + crop_md

    # Format response
    crop_response = format_crop_response(crop_data)
    disease_response = format_disease_response(disease_data)

    final_reply = crop_response + "\n\n" + disease_response + extra_info

    return {"reply": final_reply}