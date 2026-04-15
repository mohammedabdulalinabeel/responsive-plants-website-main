import mysql.connector

DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "QLd371@j_yl",   # change this
    "database": "farming_chatbot"
}

def get_connection():
    return mysql.connector.connect(**DB_CONFIG)