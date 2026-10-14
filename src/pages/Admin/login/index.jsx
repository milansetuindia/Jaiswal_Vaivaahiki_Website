
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  setAdminCsrf,
} from "../../../utils/adminApi";

import "./AdminLogin.css";

const API_URL = import.meta.env.VITE_API_URL;

function AdminLogin() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [otp, setOtp] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [step, setStep] = useState("password");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submitPassword = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/admin/login`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            password,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Login failed."
        );
      }

      setChallengeId(result.challengeId);
      setPassword("");
      setStep("otp");

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const submitOtp = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/admin/verify-otp`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            challengeId,
            otp,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Invalid OTP."
        );
      }

      setAdminCsrf(result.csrfToken);

      // Remove any credentials left from the old system.
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUsername");

      navigate("/admin", { replace: true });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">

        <h1>Admin Login</h1>
        <p>Jaiswal Vaivaahiki</p>

        {error && (
          <div className="admin-login-error">
            {error}
          </div>
        )}

        {step === "password" ? (

          <form onSubmit={submitPassword}>
            <div className="form-group">
              <label htmlFor="username">
                Username
              </label>

              <input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(event) =>
                  setUsername(event.target.value)
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
                autoComplete="current-password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading
                ? "Verifying..."
                : "Continue"}
            </button>
          </form>

        ) : (

          <form onSubmit={submitOtp}>
            <p>
              Enter the 6-digit code sent to
              the administrator email.
            </p>

            <div className="form-group">
              <label htmlFor="otp">
                Email Verification Code
              </label>

              <input
                id="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                pattern="[0-9]{6}"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(event) =>
                  setOtp(
                    event.target.value.replace(/\D/g, "")
                  )
                }
                required
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading
                ? "Verifying OTP..."
                : "Verify OTP & Login"}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep("password");
                setChallengeId("");
                setOtp("");
                setError("");
              }}
              disabled={loading}
            >
              Back to Login
            </button>
          </form>

        )}

      </div>
    </div>
  );
}

export default AdminLogin;
