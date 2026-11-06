
import { useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  publicUserRequest,
} from "../../utils/userApi";

import "./UserPortal.css";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });

  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (
      form.password !== form.confirmPassword
    ) {
      setError("Passwords do not match.");
      return;
    }

    if (!consent) {
      setError(
        "Please confirm you are authorized to register."
      );
      return;
    }

    setLoading(true);

    try {
      await publicUserRequest(
        "/register",
        {
          fullName: form.fullName,
          email: form.email,
          mobile: form.mobile,
          password: form.password,
        }
      );

      navigate(
        `/user/verify-email?email=${encodeURIComponent(
          form.email.trim()
        )}`
      );
    } catch (err) {
      if (
        err.message.includes(
          "Account created"
        )
      ) {
        navigate(
          `/user/verify-email?email=${encodeURIComponent(
            form.email.trim()
          )}`
        );
        return;
      }

      setError(err.message);
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

        <h1>Create Your Account</h1>

        <p className="user-portal-intro">
          Register to submit one biodata for
          admin approval.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="regName">
            Full Name
          </label>

          <input
            id="regName"
            type="text"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            autoComplete="name"
            maxLength={100}
            required
          />

          <label htmlFor="regEmail">
            Email Address
          </label>

          <input
            id="regEmail"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            maxLength={254}
            required
          />

          <label htmlFor="regMobile">
            Mobile Number
          </label>

          <input
            id="regMobile"
            type="tel"
            name="mobile"
            value={form.mobile}
            onChange={handleChange}
            placeholder="9876543210"
            autoComplete="tel"
            maxLength={20}
            required
          />

          <label htmlFor="regPassword">
            Password
          </label>

          <input
            id="regPassword"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            autoComplete="new-password"
            minLength={10}
            required
          />

          <small>
            Use at least 10 characters.
            Avoid common passwords.
          </small>

          <label htmlFor="regConfirm">
            Confirm Password
          </label>

          <input
            id="regConfirm"
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
            minLength={10}
            required
          />

          <label className="user-portal-check">
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) =>
                setConsent(
                  event.target.checked
                )
              }
              required
            />

            <span>
              I confirm that the information
              belongs to me or that I have
              permission to submit it. I agree
              to the{" "}
              <Link to="/privacy">
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link to="/terms">
                Terms
              </Link>.
            </span>
          </label>

          {error && (
            <p
              className="user-portal-error"
              role="alert"
            >
              {error}
            </p>
          )}

          <button
            className="user-portal-button"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>
        </form>

        <p className="user-portal-footer">
          Already registered?{" "}
          <Link to="/user/login">
            User Login
          </Link>
        </p>
      </div>
    </main>
  );
}

export default Register;
