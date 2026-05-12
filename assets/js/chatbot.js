const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const chatMessages = document.getElementById("chatMessages");
const attachmentBtn = document.getElementById("attachmentBtn");
const imageInput = document.getElementById("imageInput");
const imagePreviewContainer = document.getElementById("imagePreviewContainer");
const imagePreview = document.getElementById("imagePreview");
const removeImageBtn = document.getElementById("removeImageBtn");

let currentImageBase64 = null;

// Backend URL
const API_URL = "https://responsive-plants-website-main.onrender.com/chat";
const DEFAULT_BOT_MESSAGE = "Hi there! I can help you with planting, harvesting, pest control, and farm management. Ask me anything.";

// Add message to UI
function addMessage(text, sender = "bot", imageBase64 = null) {
  const message = document.createElement("div");
  message.className = `chatbot__message chatbot__message--${sender}`;

  let contentHtml = "";
  if (imageBase64) {
    contentHtml += `<img src="${imageBase64}" class="chatbot__message-image" alt="Uploaded Image">`;
  }

  // Remove unwanted symbols and emojis
  let formattedText = text
    .replace(/━━━━━━━━━━━━━━━━━━━━━━/g, "") // remove separator lines
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, "") // remove emojis
    .trim();

  // Convert **bold** to <strong>
  formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Convert new lines to <br>
  formattedText = formattedText.replace(/\n/g, "<br>");

  if (formattedText) {
    contentHtml += `<p class="chatbot__message-text">${formattedText}</p>`;
  }

  message.innerHTML = contentHtml;

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

// Image handling
attachmentBtn.addEventListener("click", () => {
  imageInput.click();
});

imageInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      currentImageBase64 = e.target.result;
      imagePreview.src = currentImageBase64;
      imagePreviewContainer.style.display = "flex";
    };
    reader.readAsDataURL(file);
  }
});

removeImageBtn.addEventListener("click", clearImagePreview);

function clearImagePreview() {
  currentImageBase64 = null;
  imageInput.value = "";
  imagePreview.src = "";
  imagePreviewContainer.style.display = "none";
}

// Send message to FastAPI backend
async function sendToBackend(userMessage, imageBase64 = null) {
  try {
    const payload = { message: userMessage };
    if (imageBase64) {
      payload.image = imageBase64;
    }

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
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
  if (!userText && !currentImageBase64) return;

  const imageToSend = currentImageBase64;
  clearImagePreview();
  chatInput.value = "";

  // Add user message
  addMessage(userText, "user", imageToSend);

  // Show bot typing message
  addMessage(imageToSend ? "⏳ Analyzing image..." : "⏳ Thinking...", "bot");

  // Get backend response
  const botReply = await sendToBackend(userText, imageToSend);

  // Remove typing message
  chatMessages.lastChild.remove();

  // Add actual bot response
  addMessage(botReply, "bot");
});