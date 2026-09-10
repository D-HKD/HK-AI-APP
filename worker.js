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
// 真正 AI：Cloudflare Workers AI
// =========================

if (url.pathname === "/api/chat" && request.method === "POST") {
try {
const body = await request.json();

const message = String(body.message || "").trim();

if (!message) {
return new Response(
JSON.stringify({
ok: false,
error: "請輸入問題"
}),
{
status: 400,
headers: {
...corsHeaders,
"Content-Type": "application/json"
}
}
);
}

const result = await env.AI.run(
"@cf/zai-org/glm-4.7-flash",
{
messages: [
{
role: "system",
content:
"你係 HK AI，一個香港 AI 智能助手。請使用繁體中文或香港粵語回答。回答要自然、清晰、實用。如果問題涉及香港，優先提供香港相關資訊。"
},
{
role: "user",
content: message
}
],
max_tokens: 1000
}
);

const answer =
result?.response ||
result?.output_text ||
"抱歉，AI 暫時未能回答。";

return new Response(
JSON.stringify({
ok: true,
answer
}),
{
status: 200,
headers: {
...corsHeaders,
"Content-Type": "application/json"
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
"Content-Type": "application/json"
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

const response = await fetch(target);

return new Response(response.body, {
status: response.status,
headers: {
...corsHeaders,
"Content-Type":
response.headers.get("Content-Type") ||
"application/json"
}
});

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
"Content-Type": "application/json"
}
}
);
}
}


// =========================
// MTR / LRT
// =========================

if (url.pathname === "/mtr") {

const target = url.searchParams.get("url");

const allowedTargets = [
"https://rt.data.gov.hk/v1/transport/mtr/getSchedule.php",
"https://rt.data.gov.hk/v1/transport/mtr/lrt/getSchedule"
];

if (
!target ||
!allowedTargets.some(
base => target.startsWith(base)
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
"Content-Type": "application/json"
}
}
);
}

try {

const response = await fetch(target);
const response = await fetch(target);

return new Response(response.body, {
status: response.status,
headers: {
...corsHeaders,
"Content-Type":
response.headers.get("Content-Type") ||
"application/xml"
}
});

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
"Content-Type": "application/json"
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
"Content-Type": "application/json"
}
}
);
}
};
