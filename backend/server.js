require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fetch = globalThis.fetch || require("undici").fetch;

const app = express();
const port = process.env.PORT || 8000;
const model = process.env.MODEL || "gemini-pro";
const apiKey = process.env.GOOGLE_API_KEY;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Gemini chatbot backend is running." });
});

app.post("/chat", async (req, res) => {
  try {
    if (!apiKey) {
      return res.status(500).json({ reply: "Server is not configured: GOOGLE_API_KEY is missing." });
    }

    const userMessage = req.body?.message;
    if (!userMessage || typeof userMessage !== "string") {
      return res.status(400).json({ reply: "Invalid request: message is required." });
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta2/models/${model}:generateMessage?key=${encodeURIComponent(apiKey)}`;

    const systemPrompt = `You are a friendly and helpful farm assistant. Answer questions about planting, harvesting, pest control, soil health, irrigation, and crop management. Keep responses practical and easy to follow for farmers.`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt: {
          messages: [
            {
              author: "system",
              content: {
                type: "text",
                text: systemPrompt
              }
            },
            {
              author: "user",
              content: {
                type: "text",
                text: userMessage
              }
            }
          ]
        },
        temperature: 0.2,
        topP: 0.9,
        candidateCount: 1
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", errorText);
      return res.status(500).json({ reply: "Gemini API request failed." });
    }

    const json = await response.json();
    const candidate = json?.candidates?.[0];
    const answer = candidate?.content?.find((item) => item.type === "text")?.text;

    if (!answer) {
      console.error("Gemini API response missing answer:", JSON.stringify(json));
      return res.status(500).json({ reply: "Gemini API returned an unexpected response." });
    }

    res.json({ reply: answer.trim() });
  } catch (error) {
    console.error("Chat endpoint error:", error);
    res.status(500).json({ reply: "Something went wrong while processing your request." });
  }
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
