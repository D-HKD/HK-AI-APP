export default {
async fetch(request, env) {

const url = new URL(request.url);

const corsHeaders = {
"Access-Control-Allow-Origin": "*",
"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
"Access-Control-Allow-Headers": "Content-Type"
};

if (request.method === "OPTIONS") {
return new Response(null, {
status: 204,
headers: corsHeaders
});
}


// =========================
// AI CHAT
// =========================

if (
url.pathname === "/api/chat" &&
request.method === "POST"
) {

try {

const body = await request.json();

const question =
String(body.message || "").trim();

const history =
Array.isArray(body.history)
? body.history
.filter(item =>
item &&
(
item.role === "user" ||
item.role === "assistant"
) &&
typeof item.content === "string"
)
.slice(-10)
: [];


if (!question) {

return new Response(
JSON.stringify({
ok: false,
error: "請輸入問題"
}),
{
status: 400,
headers: {
...corsHeaders,
"Content-Type":
"application/json"
}
}
);

}


const messages = [

{
role: "system",

content:
"你是 HK AI，一個香港智能助手。" +
"你必須直接回答使用者問題。" +
"不要重複使用者的問題。" +
"不要只把使用者說的話重新寫一次。" +
"請使用香港粵語或繁體中文。" +
"回答自然、清楚、實用。" +
"如果使用者只是打招呼，正常打招呼。" +
"如果不知道答案，要誠實說不知道。"
},

...history,

{
role: "user",
content: question
}

];


const result = await env.AI.run(
"@cf/zai-org/glm-4.7-flash",
{
messages: messages,
max_tokens: 800,
temperature: 0.7
}
);


// Cloudflare Workers AI
// GLM-4.7-Flash 正常回傳 response
let answer = "";

if (
result &&
typeof result.response === "string"
) {

answer = result.response;

} else if (
result &&
result.result &&
typeof result.result.response === "string"
) {

answer = result.result.response;

}


if (!answer) {

answer =
"抱歉，AI 暫時沒有產生有效回答。";
}


return new Response(
JSON.stringify({
ok: true,
answer: answer
}),
{
status: 200,

headers: {
...corsHeaders,
"Content-Type":
"application/json"
}
}
);


} catch (error) {

return new Response(
JSON.stringify({
ok: false,
error:
error?.message ||
"AI 發生未知錯誤"
}),
{
status: 500,

headers: {
...corsHeaders,
"Content-Type":
"application/json"
}
}
);

}

}


// =========================
// 香港天氣
// =========================

if (url.pathname === "/weather") {

const target =
"https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=rhrread&lang=tc";

try {

const response =
await fetch(target);

return new Response(
response.body,
{
status: response.status,

headers: {
...corsHeaders,
"Content-Type":
response.headers.get(
"Content-Type"
) ||
"application/json"
}
}
);

} catch (error) {

return new Response(
JSON.stringify({
ok: false,
error: error.message
}),
{
status: 500,

headers: {
...corsHeaders,
"Content-Type":
"application/json"
}
}
);

}

}


// =========================
// MTR / LRT
// =========================

if (url.pathname === "/mtr") {

const target =
url.searchParams.get("url");

const allowedTargets = [

"https://rt.data.gov.hk/v1/transport/mtr/getSchedule.php",

"https://rt.data.gov.hk/v1/transport/mtr/lrt/getSchedule"

];


if (
!target ||
!allowedTargets.some(
base =>
target.startsWith(base)
)
) {

return new Response(
JSON.stringify({
ok: false,
error: "Invalid MTR API URL"
}),
{
status: 400,

headers: {
...corsHeaders,
"Content-Type":
"application/json"
}
}
);

}


try {

const response =
await fetch(target);

return new Response(
response.body,
{
status: response.status,

headers: {
...corsHeaders,
"Content-Type":
response.headers.get(
"Content-Type"
) ||
"application/json"
}
}
);

} catch (error) {

return new Response(
JSON.stringify({
ok: false,
error: error.message
}),
{
status: 500,

headers: {
...corsHeaders,
"Content-Type":
"application/json"
}
}
);

}

}


// =========================
// 交通消息
// =========================

if (
url.pathname === "/trafficnews"
) {

const target =
"https://www.td.gov.hk/tc/special_news/trafficnews.xml";


try {

const response =
await fetch(target);

return new Response(
response.body,
{
status: response.status,

headers: {
...corsHeaders,
"Content-Type":
response.headers.get(
"Content-Type"
) ||
"application/xml"
}
}
);

} catch (error) {

return new Response(
JSON.stringify({
ok: false,
error: error.message
}),
{
status: 500,

headers: {
...corsHeaders,
"Content-Type":
"application/json"
}
}
);

}

}


// =========================
// 前端網站
// =========================

if (
url.pathname === "/" ||
url.pathname === "/index.html" ||
url.pathname === "/style.css" ||
url.pathname === "/app.js"
) {

return env.ASSETS.fetch(request);

}


// =========================
// 404
// =========================

return new Response(
JSON.stringify({
ok: false,
error: "Not Found"
}),
{
status: 404,

headers: {
...corsHeaders,
"Content-Type":
"application/json"
}
}
);

}
};
