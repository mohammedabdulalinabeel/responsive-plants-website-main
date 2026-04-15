import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(BASE_DIR)

KB_PATH = os.path.join(PROJECT_DIR, "knowledge_base")

def load_crop_md(crop_name: str):
    file_name = crop_name.lower().replace(" ", "_") + ".md"
    path = os.path.join(KB_PATH, "crops", file_name)

    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return f.read()

    return None


def load_disease_md(disease_name: str):
    file_name = disease_name.lower().replace(" ", "_") + ".md"
    path = os.path.join(KB_PATH, "diseases", file_name)

    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return f.read()

    return None