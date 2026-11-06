
import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  publicUserRequest,
} from "../../utils/userApi";

import "./UserPortal.css";

function VerifyEmail() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState(
    searchParams.get("email") || ""
  );

  const [otp, setOtp] = useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  // The initial registration OTP was just requested,
  // so start with a 60-second cooldown when redirected
  // from registration.
  const [secondsLeft, setSecondsLeft] = useState(
    searchParams.get("email") ? 60 : 0
  );

  // ====================================================
  // RESEND COUNTDOWN
  // ====================================================

  useEffect(() => {
    if (secondsLeft <= 0) {
      return;
    }

    const timer = setTimeout(() => {
      setSecondsLeft((previous) =>
        Math.max(previous - 1, 0)
      );
    }, 1000);

    return () => clearTimeout(timer);
  }, [secondsLeft]);

  // ====================================================
  // VERIFY OTP
  // ====================================================

  async function handleVerify(event) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    try {
      await publicUserRequest(
        "/verify-email",
        {
          email: email.trim(),
          otp: otp.trim(),
        }
      );

      navigate("/user/login", {
        replace: true,
        state: {
          message:
            "Email verified successfully. You can now log in.",
        },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ====================================================
  // RESEND OTP
  // ====================================================

  async function handleResend() {
    if (loading || secondsLeft > 0) {
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const result =
        await publicUserRequest(
          "/resend-verification",
          {
            email: email.trim(),
          }
        );

      setMessage(result.message);

      // Client-side cooldown is for convenience.
      // The backend independently enforces the limit.
      setSecondsLeft(60);

    } catch (err) {
      setError(err.message);

      // The backend provides its own rate limits.
      // Do not repeatedly retry when rate-limited.
      if (
        err.message.includes("60 seconds") ||
        err.message.includes("Daily OTP limit") ||
        err.message.includes("Too many")
      ) {
        setSecondsLeft(60);
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

        <h1>Verify Email Address</h1>

        <p className="user-portal-intro">
          Enter the six-digit verification
          code sent to your registered
          email address.
        </p>

        <form onSubmit={handleVerify}>

          <label htmlFor="verifyEmail">
            Email Address
          </label>

          <input
            id="verifyEmail"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            required
          />

          <label htmlFor="verifyOtp">
            Six-Digit OTP
          </label>

          <input
            id="verifyOtp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(event) =>
              setOtp(
                event.target.value.replace(
                  /\D/g,
                  ""
                )
              )
            }
            required
          />

          <p className="user-portal-intro">
            The OTP is valid for
            <strong> 10 minutes</strong>.
            You have a maximum of
            <strong> 5 attempts</strong>
            to enter each code.
          </p>

          {message && (
            <p
              className="user-portal-success"
              role="status"
            >
              {message}
            </p>
          )}

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
            disabled={loading || otp.length !== 6}
          >
            {loading
              ? "Verifying..."
              : "Verify Email"}
          </button>

        </form>

        <div
          style={{
            marginTop: "22px",
            textAlign: "center",
          }}
        >
          <p>
            Didn't receive the OTP?
          </p>

          <button
            type="button"
            className="user-portal-secondary"
            onClick={handleResend}
            disabled={
              loading ||
              secondsLeft > 0 ||
              !email.trim()
            }
          >
            {secondsLeft > 0
              ? `Resend OTP in ${secondsLeft}s`
              : "Resend OTP"}
          </button>

          <p
            style={{
              fontSize: "13px",
              color: "#667085",
              marginTop: "12px",
              lineHeight: "1.6",
            }}
          >
            Maximum 5 verification OTP
            requests per account in any
            24-hour period.
          </p>
        </div>

        <p className="user-portal-footer">
          <Link to="/user/login">
            Back to Login
          </Link>
        </p>

      </div>
    </main>
  );
}

export default VerifyEmail;
