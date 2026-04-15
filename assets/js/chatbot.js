const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chatMessages = document.getElementById('chatMessages');

const botReplies = [
  'Try watering your crop early in the morning to reduce evaporation and improve absorption.',
  'For healthy soil, add compost once a month and rotate crops regularly.',
  'Keep an eye on leaf yellowing; it often means nutrient imbalance or overwatering.',
  'Mix neem oil with water to manage common pests naturally without harming plants.',
  'Planting legumes can improve soil nitrogen and support future vegetables.',
  'Mulching helps retain moisture and keeps weeds down in the growing season.'
];

function addMessage(text, sender = 'bot') {
  const message = document.createElement('div');
  message.className = `chatbot__message chatbot__message--${sender}`;
  message.innerHTML = `<p class="chatbot__message-text">${text}</p>`;
  chatMessages.appendChild(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const userText = chatInput.value.trim();
  if (!userText) return;

  addMessage(userText, 'user');
  chatInput.value = '';

  setTimeout(() => {
    const reply = botReplies[Math.floor(Math.random() * botReplies.length)];
    addMessage(reply, 'bot');
  }, 700);
});
