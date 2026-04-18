const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const chatMessages = document.getElementById("chatMessages");

// Backend URL
const API_URL = "https://plantgrowingguide.netlify.app/chat";
const DEFAULT_BOT_MESSAGE = "Hi there! I can help you with planting, harvesting, pest control, and farm management. Ask me anything.";

// Add message to UI
function addMessage(text, sender = "bot") {
  const message = document.createElement("div");
  message.className = `chatbot__message chatbot__message--${sender}`;

  // Remove unwanted symbols and emojis
  let formattedText = text
    .replace(/━━━━━━━━━━━━━━━━━━━━━━/g, "") // remove separator lines
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, "") // remove emojis
    .trim();

  // Convert **bold** to <strong>
  formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Convert new lines to <br>
  formattedText = formattedText.replace(/\n/g, "<br>");

  message.innerHTML = `<p class="chatbot__message-text">${formattedText}</p>`;

  chatMessages.appendChild(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Ensure default message appears when chat is empty
function initChatbotDefault() {
  if (!chatMessages.querySelector('.chatbot__message')) {
    addMessage(DEFAULT_BOT_MESSAGE, 'bot');
  }
}

initChatbotDefault();

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