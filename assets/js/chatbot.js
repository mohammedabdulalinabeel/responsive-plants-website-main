const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const chatMessages = document.getElementById("chatMessages");

// Backend URL
const API_URL = "http://127.0.0.1:8000/chat";

// Add message to UI
function addMessage(text, sender = "bot") {
  const message = document.createElement("div");
  message.className = `chatbot__message chatbot__message--${sender}`;
  message.innerHTML = `<p class="chatbot__message-text">${text}</p>`;
  chatMessages.appendChild(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Send message to FastAPI backend
async function sendToBackend(userMessage) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: userMessage })
    });

    const data = await response.json();
    return data.reply;
  } catch (error) {
    console.error("Backend Error:", error);
    return "❌ Unable to connect to server. Please check if backend is running.";
  }
}

// Handle chat form submit
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const userText = chatInput.value.trim();
  if (!userText) return;

  // Add user message
  addMessage(userText, "user");
  chatInput.value = "";

  // Show bot typing message
  addMessage("⏳ Thinking...", "bot");

  // Get backend response
  const botReply = await sendToBackend(userText);

  // Remove typing message
  chatMessages.lastChild.remove();

  // Add actual bot response
  addMessage(botReply, "bot");
});