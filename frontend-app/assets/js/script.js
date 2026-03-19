// CONFIG
const KEYCLOAK_URL = "https://login-cloud.dnn.lat";
const REALM = "cliente1";
const CLIENT_ID = "frontend";
const REDIRECT_URI = window.location.origin;

// 🚀 LOGIN
function login() {
  const authUrl = new URL(`${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/auth`);

  authUrl.searchParams.set("client_id", CLIENT_ID);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "openid");
  authUrl.searchParams.set("redirect_uri", REDIRECT_URI);

  window.location.href = authUrl.toString();
}

// 🚀 PEGAR CODE
function getCodeFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("code");
}

// 🚀 TROCAR CODE POR TOKEN
async function getToken(code) {
  try {
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

    if (!response.ok) {
      throw new Error("Erro ao autenticar");
    }

    const data = await response.json();

    localStorage.setItem("access_token", data.access_token);

    console.log("TOKEN:", data);

    // 🔥 limpa URL (?code=...)
    window.history.replaceState({}, document.title, "/");

    updateUI();

  } catch (error) {
    console.error("Erro no login:", error);
  }
}

// 🚀 VERIFICAR LOGIN
function isLoggedIn() {
  return localStorage.getItem("access_token") !== null;
}

// 🚀 LOGOUT
function logout() {
  localStorage.removeItem("access_token");

  window.location.href =
    `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/logout?redirect_uri=${window.location.origin}`;
}

// 🚀 CHAMAR API
async function callAPI() {
  const token = localStorage.getItem("access_token");

  if (!token) {
    alert("Você precisa fazer login!");
    return;
  }

  try {
    const res = await fetch("https://api-cloud.dnn.lat", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();
    console.log("API:", data);

  } catch (error) {
    console.error("Erro na API:", error);
  }
}

// 🚀 ATUALIZAR UI
function updateUI() {
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  if (!loginBtn || !logoutBtn) return;

  if (isLoggedIn()) {
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
  } else {
    loginBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
  }
}

// 🚀 EXECUÇÃO AUTOMÁTICA
(function init() {
  const code = getCodeFromURL();

  if (code) {
    getToken(code);
  } else {
    updateUI();
  }
})();