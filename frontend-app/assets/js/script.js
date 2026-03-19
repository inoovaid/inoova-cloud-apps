//🚀 PASSO 2 — SCRIPT DE LOGIN
const KEYCLOAK_URL = "https://login-cloud.dnn.lat";
const REALM = "cliente1";
const CLIENT_ID = "frontend";
const REDIRECT_URI = window.location.origin;

function login() {
  const url = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/auth?client_id=${CLIENT_ID}&response_type=code&scope=openid&redirect_uri=${REDIRECT_URI}`;
  window.location.href = url;
}

//🚀 PASSO 3 — CAPTURAR O CODE
function getCodeFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("code");
}

//🚀 PASSO 4 — TROCAR CODE POR TOKEN 🔥
async function getToken(code) {
  const response = await fetch(`${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: CLIENT_ID,
      code: code,
      redirect_uri: REDIRECT_URI
    })
  });

  const data = await response.json();

  localStorage.setItem("access_token", data.access_token);

  console.log("TOKEN:", data);
}

//🚀 PASSO 5 — EXECUTAR AUTOMÁTICO
const code = getCodeFromURL();

if (code) {
  getToken(code);
}

//🚀 PASSO 6 — USAR TOKEN NA API 🔥
async function callAPI() {
  const token = localStorage.getItem("access_token");

  const res = await fetch("https://api-cloud.dnn.lat", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await res.json();
  console.log(data);
}

//👉 Verificar se está logado
function isLoggedIn() {
  return localStorage.getItem("access_token") !== null;
}

//👉 Logout
function logout() {
  localStorage.removeItem("access_token");

  window.location.href = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/logout?redirect_uri=${window.location.origin}`;
}
