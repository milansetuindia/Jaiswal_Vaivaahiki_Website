
import { useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  loginUser,
} from "../../utils/userApi";

import "./UserPortal.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [needsVerification, setNeedsVerification] =
    useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setNeedsVerification(false);

    try {
      await loginUser(
        identifier.trim(),
        password
      );

      navigate("/user/dashboard", {
        replace: true,
      });
    } catch (err) {
      setError(err.message);

      if (
        err.message.toLowerCase().includes(
          "verify your email"
        )
      ) {
        setNeedsVerification(true);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="user-portal">
      <div className="user-portal-card">
        <Link
          className="user-portal-back"
          to="/"
        >
          ← Back to Home
        </Link>

        <h1>User Login</h1>

        <p className="user-portal-intro">
          Log in to your Jaiswal Vaivaahiki
          account.
        </p>

        {location.state?.message && (
          <p className="user-portal-success">
            {location.state.message}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <label htmlFor="loginIdentifier">
            Email Address or Mobile Number
          </label>

          <input
            id="loginIdentifier"
            type="text"
            value={identifier}
            onChange={(event) =>
              setIdentifier(
                event.target.value
              )
            }
            placeholder="Email or mobile number"
            autoComplete="username"
            required
          />

          <label htmlFor="loginPassword">
            Password
          </label>

          <input
            id="loginPassword"
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(
                event.target.value
              )
            }
            autoComplete="current-password"
            required
          />



          {/* ======================================================
              FORGOT PASSWORD LINK
          ====================================================== */}

          <div
            style={{
              textAlign: "right",
              marginTop: "8px",
              marginBottom: "18px",
            }}
          >
            <Link
              to="/user/forgot-password"
              style={{
                color: "#8b0000",
                fontSize: "14px",
                fontWeight: "600",
                textDecoration: "none",
              }}
            >
              Forgot Password?
            </Link>
          </div>




          {error && (
            <p
              className="user-portal-error"
              role="alert"
            >
              {error}
            </p>
          )}

          {needsVerification &&
            identifier.includes("@") && (
              <p>
                <Link
                  to={`/user/verify-email?email=${encodeURIComponent(
                    identifier.trim()
                  )}`}
                >
                  Verify your email
                </Link>
              </p>
            )}

          <button
            className="user-portal-button"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Logging In..."
              : "Login"}
          </button>
        </form>

        <p className="user-portal-footer">
          Don't have an account?{" "}
          <Link to="/user/register">
            Create Account
          </Link>
        </p>
      </div>
    </main>
  );
}

export default Login;
