const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const voiceBtn = document.getElementById("voiceBtn");
const themeBtn = document.getElementById("themeBtn");
const quickButtons = document.querySelectorAll(".quick-buttons button");


// =========================
// 顯示訊息
// =========================

function addMessage(text, type = "ai") {

const message = document.createElement("div");
message.className = `message ${type}`;

const avatar = document.createElement("div");
avatar.className = "avatar";
avatar.textContent = type === "user" ? "👤" : "🤖";

const bubble = document.createElement("div");
bubble.className = "bubble";

if (type === "ai") {
bubble.innerHTML = `
<strong>HK AI</strong>
<p>${formatText(text)}</p>
`;
} else {
bubble.innerHTML = `
<p>${formatText(text)}</p>
`;
}

message.appendChild(avatar);
message.appendChild(bubble);

chatBox.appendChild(message);
chatBox.scrollTop = chatBox.scrollHeight;
}


// =========================
// 防止 HTML 注入
// =========================

function formatText(text) {

return String(text)
.replace(/&/g, "&amp;")
.replace(/</g, "&lt;")
.replace(/>/g, "&gt;")
.replace(/\n/g, "<br>");
}


// =========================
// 呼叫真正 AI
// =========================

async function askAI(question) {

const response = await fetch("/api/chat", {
method: "POST",

headers: {
"Content-Type": "application/json"
},

body: JSON.stringify({
message: question
})
});

const data = await response.json();

if (!response.ok || !data.ok) {
throw new Error(
data.error || "AI 暫時未能回答"
);
}

return data.answer;
}


// =========================
// 發送訊息
// =========================

async function sendMessage() {

const question = userInput.value.trim();

if (!question) {
return;
}

addMessage(question, "user");

userInput.value = "";

sendBtn.disabled = true;
userInput.disabled = true;

// 顯示思考中
addMessage("🤔 AI 正在思考……", "ai");

try {

const answer = await askAI(question);

// 移除最後一個「思考中」
const messages =
chatBox.querySelectorAll(".message");

if (messages.length > 0) {
messages[messages.length - 1].remove();
}

addMessage(answer, "ai");

} catch (error) {

const messages =
chatBox.querySelectorAll(".message");

if (messages.length > 0) {
messages[messages.length - 1].remove();
}

addMessage(
"⚠️ 暫時連接不到 AI。\n\n" +
error.message,
"ai"
);

} finally {

sendBtn.disabled = false;
userInput.disabled = false;

userInput.focus();
}
}


// =========================
// 發送按鈕
// =========================

sendBtn.addEventListener(
"click",
sendMessage
);


// =========================
// Enter 發送
// =========================

userInput.addEventListener(
"keydown",
(event) => {

if (event.key === "Enter") {
sendMessage();
}

}
);


// =========================
// 快速問題
// =========================

quickButtons.forEach(button => {

button.addEventListener(
"click",
() => {

userInput.value =
button.dataset.question;

sendMessage();

}
);

});


// =========================
// 夜間模式
// =========================

themeBtn.addEventListener(
"click",
() => {

document.body.classList.toggle("dark");

themeBtn.textContent =
document.body.classList.contains("dark")
? "☀️"
: "🌙";

}
);


// =========================
// 語音輸入
// =========================

const SpeechRecognition =
window.SpeechRecognition ||
window.webkitSpeechRecognition;

if (SpeechRecognition) {

const recognition =
new SpeechRecognition();

recognition.lang = "zh-HK";
recognition.continuous = false;
recognition.interimResults = false;

voiceBtn.addEventListener(
"click",
() => {

recognition.start();
voiceBtn.textContent = "🔴";

}
);

recognition.onresult =
(event) => {

userInput.value =
event.results[0][0].transcript;
