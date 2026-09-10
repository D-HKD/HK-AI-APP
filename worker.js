export default {
async fetch(request, env) {
const url = new URL(request.url);

// CORS
const corsHeaders = {
"Access-Control-Allow-Origin": "*",
"Access-Control-Allow-Methods": "GET,POST,OPTIONS",
"Access-Control-Allow-Headers": "Content-Type"
};

// OPTIONS
if (request.method === "OPTIONS") {
return new Response(null, {
status: 204,
headers: corsHeaders
});
}

// =========================
// 網站前端
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
// 香港天氣 API
// =========================

if (url.pathname === "/weather") {

const target =
"https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=rhrread&lang=tc";

try {

const response = await fetch(target, {
headers: {
"User-Agent": "HK-AI-App"
}
});

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
// MTR / LRT API Proxy
// =========================

if (url.pathname === "/mtr") {

const target = url.searchParams.get("url");

const allowedTargets = [
"https://rt.data.gov.hk/v1/transport/mtr/getSchedule.php",
"https://rt.data.gov.hk/v1/transport/mtr/lrt/getSchedule"
];

if (
!target ||
!allowedTargets.some(base => target.startsWith(base))
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

const response = await fetch(target, {
headers: {
"User-Agent": "HK-AI-App"
}
});

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
// 交通消息
// =========================

if (url.pathname === "/trafficnews") {

const target =
"https://www.td.gov.hk/tc/special_news/trafficnews.xml";

try {

const response = await fetch(target, {
headers: {
"User-Agent": "HK-AI-App"
}
});

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
// 其他網址
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
