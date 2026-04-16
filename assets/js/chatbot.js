const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const chatMessages = document.getElementById("chatMessages");

// Backend URL
const API_URL = "http://127.0.0.1:8000/chat";

// Add message to UI
function addMessage(text, sender = "bot") {
  const message = document.createElement("div");
  message.className = `chatbot__message chatbot__message--${sender}`;
  
  let formattedText = text;
  if (sender === "bot") {
    formattedText = formatBotMessage(text);
  } else {
    formattedText = `<p>${text}</p>`;
  }
  
  message.innerHTML = `<div class="chatbot__message-content">${formattedText}</div>`;
  chatMessages.appendChild(message);
  
  // Add fade-in animation
  setTimeout(() => message.classList.add('fade-in'), 10);
  
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Format bot message with HTML
function formatBotMessage(text) {
  // Replace <br> with paragraph breaks
  let html = text.replace(/<br\s*\/?>/gi, '</p><p>');
  
  // Make headings bold
  html = html.replace(/(🌱 [^:]*:)/g, '<strong>$1</strong>');
  html = html.replace(/(📌 [^:]*:)/g, '<strong>$1</strong>');
  html = html.replace(/(💧 [^:]*:)/g, '<strong>$1</strong>');
  // Add more patterns if needed
  
  return '<p>' + html + '</p>';
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