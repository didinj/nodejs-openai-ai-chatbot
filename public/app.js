const chatForm = document.getElementById("chat-form");
const messageInput = document.getElementById("message-input");
const chatBox = document.getElementById("chat-box");

// Append message to chat box
function addMessage(text, sender) {
  const div = document.createElement("div");
  div.classList.add(
    "message",
    sender === "user" ? "user-message" : "bot-message"
  );
  div.textContent = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Handle form submit
chatForm.addEventListener("submit", async e => {
  e.preventDefault();
  const message = messageInput.value;
  addMessage(message, "user");
  messageInput.value = "";

  try {
    const response = await fetch("http://localhost:5000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });

    const data = await response.json();
    if (data.reply) {
      addMessage(data.reply, "bot");
    } else {
      addMessage("Error: No reply from server", "bot");
    }
  } catch (error) {
    addMessage("Error connecting to server", "bot");
  }
});

async function sendMessage() {
  const input = document.getElementById("user-input");
  const message = input.value.trim();
  if (!message) return;

  const messagesDiv = document.getElementById("messages");
  messagesDiv.innerHTML += `<p><strong>You:</strong> ${message}</p>`;
  input.value = "";

  // Show loading indicator
  document.getElementById("loading").style.display = "block";

  const response = await fetch("http://localhost:3000/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message })
  });

  const data = await response.json();

  // Hide loading indicator
  document.getElementById("loading").style.display = "none";

  messagesDiv.innerHTML += `<p><strong>Bot:</strong> ${data.reply}</p>`;
}

async function sendMessageStream() {
  const input = document.getElementById("user-input");
  const message = input.value.trim();
  if (!message) return;

  const messagesDiv = document.getElementById("messages");
  messagesDiv.innerHTML += `<p><strong>You:</strong> ${message}</p>`;
  input.value = "";

  const botMessage = document.createElement("p");
  botMessage.innerHTML = "<strong>Bot:</strong> ";
  messagesDiv.appendChild(botMessage);

  const response = await fetch("http://localhost:3000/chat-stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split("\n\n");

    for (const line of lines) {
      if (line.startsWith("data:")) {
        const data = line.replace("data: ", "");
        if (data === "[DONE]") return;
        botMessage.innerHTML += data;
      }
    }
  }
}
