
const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/$/, "");

let userCsrfToken = null;

// ======================================================
// PUBLIC USER API
// Registration, verification and login
// ======================================================

export async function publicUserRequest(path, data) {
  const response = await fetch(
    `${API_URL}/api/users${path}`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Request failed."
    );
  }

  return result;
}

// ======================================================
// RESTORE AUTHENTICATED USER SESSION
// ======================================================

export async function getUserSession() {
  const response = await fetch(
    `${API_URL}/api/users/me`,
    {
      credentials: "include",
      cache: "no-store",
    }
  );

  if (!response.ok) {
    userCsrfToken = null;
    return null;
  }

  const result = await response.json();

  userCsrfToken = result.csrfToken;

  return result.user || null;
}

// ======================================================
// USER LOGIN
// ======================================================

export async function loginUser(identifier, password) {
  const result = await publicUserRequest(
    "/login",
    {
      identifier,
      password,
    }
  );

  userCsrfToken = result.csrfToken;

  return result.user;
}

// ======================================================
// AUTHENTICATED USER API
// ======================================================

export async function userFetch(path, options = {}) {
  if (!userCsrfToken) {
    const user = await getUserSession();

    if (!user) {
      throw new Error(
        "Please log in to continue."
      );
    }
  }

  const method = (
    options.method || "GET"
  ).toUpperCase();

  const headers = new Headers(
    options.headers || {}
  );

  if (
    ["POST", "PUT", "PATCH", "DELETE"].includes(
      method
    )
  ) {
    headers.set(
      "X-User-CSRF",
      userCsrfToken
    );
  }

  const response = await fetch(
    `${API_URL}${path}`,
    {
      ...options,
      method,
      headers,
      credentials: "include",
    }
  );

  if (response.status === 401) {
    userCsrfToken = null;
  }

  return response;
}

// ======================================================
// USER LOGOUT
// ======================================================

export async function logoutUser() {
  const response = await userFetch(
    "/api/users/logout",
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    throw new Error("Logout failed.");
  }

  userCsrfToken = null;

  return true;
}
