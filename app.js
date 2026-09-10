const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const voiceBtn = document.getElementById("voiceBtn");
const themeBtn = document.getElementById("themeBtn");
const quickButtons = document.querySelectorAll(".quick-buttons button");


// =========================
// 加入訊息
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
// 簡單文字格式
// =========================

function formatText(text) {

return String(text)
.replace(/&/g, "&amp;")
.replace(/</g, "&lt;")
.replace(/>/g, "&gt;")
.replace(/\n/g, "<br>");
}


// =========================
// 測試版 AI 回覆
// =========================

function localAI(question) {

const q = question.toLowerCase();

if (
q.includes("你好") ||
q.includes("hello") ||
q.includes("hi")
) {
return "你好！👋 我係 HK AI。你今日想問我啲咩？";
}

if (
q.includes("天氣") ||
q.includes("天氣點")
) {
return "🌤️ 暫時係測試模式。下一階段我哋會接入香港天文台實時天氣資料。";
}

if (
q.includes("交通") ||
q.includes("塞車")
) {
return "🚗 暫時係測試模式。下一階段可以接入香港交通消息，出現重要交通事故時亦可以發出提示。";
}

if (
q.includes("公共交通") ||
q.includes("巴士") ||
q.includes("港鐵") ||
q.includes("輕鐵")
) {
return "🚆 我可以幫你做香港公共交通助手。之後可以加入巴士、港鐵、輕鐵及實時到站資料。";
}

return `
收到：「${question}」

目前係 HK AI 第一階段測試版。

下一階段會接入真正 AI，
到時你可以直接同我自然對話。
`;
}


// =========================
// 發送訊息
// =========================

function sendMessage() {

const question = userInput.value.trim();

if (!question) {
return;
}

addMessage(question, "user");

userInput.value = "";

sendBtn.disabled = true;

setTimeout(() => {

const answer = localAI(question);

addMessage(answer, "ai");

sendBtn.disabled = false;

userInput.focus();

}, 500);
}


// =========================
// 發送按鈕
// =========================

sendBtn.addEventListener("click", sendMessage);


// =========================
// Enter 發送
// =========================

userInput.addEventListener("keydown", (event) => {

if (event.key === "Enter") {
sendMessage();
}

});


// =========================
// 快速問題
// =========================

quickButtons.forEach(button => {

button.addEventListener("click", () => {

const question = button.dataset.question;

userInput.value = question;

sendMessage();

});

});


// =========================
// 夜間模式
// =========================

themeBtn.addEventListener("click", () => {

document.body.classList.toggle("dark");

if (document.body.classList.contains("dark")) {

themeBtn.textContent = "☀️";

} else {

themeBtn.textContent = "🌙";

}

});


// =========================
// 語音輸入
// =========================

const SpeechRecognition =
window.SpeechRecognition ||
window.webkitSpeechRecognition;

if (SpeechRecognition) {

const recognition = new SpeechRecognition();

recognition.lang = "zh-HK";

recognition.continuous = false;

recognition.interimResults = false;

voiceBtn.addEventListener("click", () => {

recognition.start();

voiceBtn.textContent = "🔴";

});

recognition.onresult = (event) => {

const text =
event.results[0][0].transcript;

userInput.value = text;

voiceBtn.textContent = "🎤";

};

recognition.onend = () => {

voiceBtn.textContent = "🎤";

};

recognition.onerror = () => {

voiceBtn.textContent = "🎤";

};

} else {

voiceBtn.addEventListener("click", () => {

alert("你目前使用的瀏覽器不支援語音輸入。");

});

}
