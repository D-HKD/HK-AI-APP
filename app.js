console.log("HK AI app.js loaded");

const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const voiceBtn = document.getElementById("voiceBtn");
const themeBtn = document.getElementById("themeBtn");

let conversationHistory = [];


// =========================
// 顯示訊息
// =========================

function addMessage(text, type = "ai") {

if (!chatBox) {
alert("錯誤：找不到 chatBox");
return;
}

const message = document.createElement("div");
message.className = "message " + type;

const avatar = document.createElement("div");
avatar.className = "avatar";
avatar.textContent = type === "user" ? "👤" : "🤖";

const bubble = document.createElement("div");
bubble.className = "bubble";

const strong =
type === "ai"
? "<strong>HK AI</strong>"
: "";

bubble.innerHTML =
strong +
"<p>" +
formatText(text) +
"</p>";

message.appendChild(avatar);
message.appendChild(bubble);

chatBox.appendChild(message);

chatBox.scrollTop = chatBox.scrollHeight;
}


// =========================
// 文字安全處理
// =========================

function formatText(text) {

return String(text)
.replace(/&/g, "&amp;")
.replace(/</g, "&lt;")
.replace(/>/g, "&gt;")
.replace(/\n/g, "<br>");
}


// =========================
// 呼叫 Worker AI
// =========================

async function askAI(question) {

console.log("Sending:", question);

const response = await fetch("/api/chat", {

method: "POST",

headers: {
"Content-Type": "application/json"
},

body: JSON.stringify({

message: question,

history: conversationHistory

})

});

console.log("HTTP status:", response.status);

const rawText = await response.text();

console.log("Worker response:", rawText);

let data;

try {

data = JSON.parse(rawText);

} catch (error) {

throw new Error(
"Worker 返回的不是 JSON：\n" +
rawText.substring(0, 500)
);

}

if (!response.ok || !data.ok) {

throw new Error(
data.error ||
"AI Worker 發生錯誤"
);

}

if (!data.answer) {

throw new Error(
"AI 沒有返回回答"
);

}

return data.answer;
}


// =========================
// 發送訊息
// =========================

async function sendMessage() {

console.log("SEND BUTTON CLICKED");

if (!userInput) {

alert("錯誤：找不到 userInput");

return;
}

const question =
userInput.value.trim();

if (!question) {

return;
}


// 立即顯示使用者訊息
addMessage(question, "user");

userInput.value = "";


if (sendBtn) {
sendBtn.disabled = true;
}

userInput.disabled = true;


// 顯示連線狀態
addMessage(
"⏳ 正在連接 HK AI……",
"ai"
);


try {

const answer =
await askAI(question);


// 移除最後一個「連線中」
const messages =
chatBox.querySelectorAll(".message");

if (messages.length > 0) {

messages[messages.length - 1].remove();

}


// 顯示 AI 回答
addMessage(
answer,
"ai"
);


// 保存對話
conversationHistory.push({

role: "user",
content: question

});

conversationHistory.push({

role: "assistant",
content: answer

});


// 最多保留 10 條
if (
conversationHistory.length > 10
) {

conversationHistory =
conversationHistory.slice(-10);

}


} catch (error) {

console.error(
"HK AI ERROR:",
error
);


// 移除「連線中」
const messages =
chatBox.querySelectorAll(".message");

if (messages.length > 0) {

messages[messages.length - 1].remove();

}


// 顯示真正錯誤
addMessage(

"❌ 發生錯誤\n\n" +
error.message,

"ai"

);

}


if (sendBtn) {
sendBtn.disabled = false;
}

userInput.disabled = false;

userInput.focus();

}


// =========================
// Send 按鈕
// =========================

if (sendBtn) {

sendBtn.addEventListener(
"click",
function(event) {

event.preventDefault();

sendMessage();

}
);

} else {

console.error(
"找不到 sendBtn"
);

}


// =========================
// Enter
// =========================

if (userInput) {

userInput.addEventListener(
"keydown",
function(event) {

if (event.key === "Enter") {

event.preventDefault();

sendMessage();

}

}
);

}


// =========================
// 快速按鈕
// =========================

const quickButtons =
document.querySelectorAll(
".quick-buttons button"
);


quickButtons.forEach(button => {

button.addEventListener(
"click",
function() {

if (!userInput) return;

const question =
button.dataset.question;

if (question) {

userInput.value =
question;

sendMessage();

}

}
);

});


// =========================
// 夜間模式
// =========================

if (themeBtn) {

themeBtn.addEventListener(
"click",
function() {

document.body.classList.toggle(
"dark"
);

themeBtn.textContent =
document.body.classList.contains("dark")
? "☀️"
: "🌙";

}
);

}


// =========================
// 廣東話語音
// =========================

const SpeechRecognition =
window.SpeechRecognition ||
window.webkitSpeechRecognition;


if (
SpeechRecognition &&
voiceBtn
) {

const recognition =
new SpeechRecognition();

recognition.lang = "zh-HK";

recognition.continuous = false;

recognition.interimResults = false;


voiceBtn.addEventListener(
"click",
function() {

try {

recognition.start();

voiceBtn.textContent =
"🔴";

} catch (error) {

console.log(error);

}

}
);


recognition.onresult =
function(event) {

userInput.value =
event.results[0][0]
.transcript;

voiceBtn.textContent =
"🎤";

};


recognition.onend =
function() {

voiceBtn.textContent =
"🎤";

};


recognition.onerror =
function() {

voiceBtn.textContent =
"🎤";

};

}


// =========================
// 啟動完成
// =========================

console.log(
"HK AI frontend ready"
);
