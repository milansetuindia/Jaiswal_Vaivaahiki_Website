// src/components/admin/ProtectedAdminRoute.jsx

import { Navigate, Outlet } from "react-router-dom";

function isTokenExpired(token) {
  try {
    // JWT has three parts:
    // header.payload.signature

    const parts = token.split(".");

    if (parts.length !== 3) {
      return true;
    }

    const payload = parts[1];

    // Convert Base64URL to normal Base64
    const base64 = payload
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(
          (character) =>
            "%" +
            (
              "00" +
              character
                .charCodeAt(0)
                .toString(16)
            ).slice(-2)
        )
        .join("")
    );

    const decoded = JSON.parse(jsonPayload);

    // JWT exp is stored in seconds
    if (!decoded.exp) {
      return true;
    }

    const currentTime = Math.floor(
      Date.now() / 1000
    );

    return decoded.exp <= currentTime;

  } catch (error) {
    console.error(
      "JWT validation error:",
      error
    );

    return true;
  }
}

function ProtectedAdminRoute() {
  const token =
    localStorage.getItem("adminToken");

  // No token
  if (!token) {
    return (
      <Navigate
        to="/admin/login"
        replace
      />
    );
  }

  // Token exists but has expired
  if (isTokenExpired(token)) {
    localStorage.removeItem("adminToken");

    return (
      <Navigate
        to="/admin/login"
        replace
      />
    );
  }

  // Token exists and is not expired
  return <Outlet />;
}

export default ProtectedAdminRoute;