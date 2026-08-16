// src/pages/Admin/Login/index.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";

const API_URL = import.meta.env.VITE_API_URL;

function AdminLogin() {
  const navigate = useNavigate();

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!username || !password) {
      setError(
        "Please enter username and password."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/admin/login`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            username,
            password,
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Login failed."
        );
      }

      localStorage.setItem(
        "adminToken",
        result.token
      );

      localStorage.setItem(
        "adminUsername",
        result.admin.username
      );

      navigate("/admin");

    } catch (error) {
      console.error(
        "Admin login error:",
        error
      );

      setError(
        error.message ||
          "Unable to login."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">

      <div className="admin-login-card">

        <h1>
          Admin Login
        </h1>

        <p>
          Jaiswal Vaivaahiki
        </p>

        {error && (
          <div className="admin-login-error">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
        >

          <div className="form-group">

            <label htmlFor="username">
              Username
            </label>

            <input
              id="username"
              type="text"
              placeholder="Enter admin username"
              value={username}
              onChange={(event) =>
                setUsername(
                  event.target.value
                )
              }
              required
            />

          </div>

          <div className="form-group">

            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              required
            />

          </div>

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>

        </form>

      </div>

    </div>
  );
}

export default AdminLogin;