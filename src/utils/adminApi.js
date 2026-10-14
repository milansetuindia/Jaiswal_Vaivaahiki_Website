
const API_URL = import.meta.env.VITE_API_URL;

let csrfToken = null;

// Set after successful OTP verification.
export function setAdminCsrf(token) {
  csrfToken = token;
}

// Check whether the HttpOnly cookie is still valid.
// Also restore the CSRF token after page refresh.
export async function checkAdminSession() {
  try {
    const response = await fetch(
      `${API_URL}/api/admin/me`,
      {
        credentials: "include",
        cache: "no-store",
      }
    );

    if (!response.ok) {
      csrfToken = null;
      return false;
    }

    const result = await response.json();
    csrfToken = result.csrfToken;

    return Boolean(result.success);
  } catch {
    csrfToken = null;
    return false;
  }
}

// Use this for admin-only API requests.
export async function adminFetch(path, options = {}) {
  if (!csrfToken) {
    const valid = await checkAdminSession();

    if (!valid) {
      throw new Error("Admin session expired.");
    }
  }

  const method = (options.method || "GET").toUpperCase();

  const headers = new Headers(options.headers || {});

  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    headers.set("X-Admin-CSRF", csrfToken);
  }

  const response = await fetch(
    `${API_URL}${path}`,
    {
      ...options,
      headers,
      credentials: "include",
    }
  );

  if (response.status === 401) {
    csrfToken = null;
  }

  return response;
}

export async function logoutAdmin() {
  const response = await adminFetch(
    "/api/admin/logout",
    { method: "POST" }
  );

  if (!response.ok) {
    throw new Error("Logout failed.");
  }

  csrfToken = null;

  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminUsername");
}



