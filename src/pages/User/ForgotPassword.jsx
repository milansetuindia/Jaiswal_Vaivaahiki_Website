
import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  publicUserRequest,
} from "../../utils/userApi";

import "./UserPortal.css";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [otpRequested, setOtpRequested] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [secondsLeft, setSecondsLeft] =
    useState(0);

  // ====================================================
  // RESEND COUNTDOWN
  // ====================================================

  useEffect(() => {
    if (secondsLeft <= 0) {
      return;
    }

    const timer = setTimeout(() => {
      setSecondsLeft((previous) =>
        Math.max(0, previous - 1)
      );
    }, 1000);

    return () => clearTimeout(timer);

  }, [secondsLeft]);

  // ====================================================
  // REQUEST OTP
  // ====================================================

  async function handleRequestOtp(event) {
    event?.preventDefault();

    if (loading || secondsLeft > 0) {
      return;
    }

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const result =
        await publicUserRequest(
          "/password-reset/request",
          {
            email: email.trim(),
          }
        );

      setOtpRequested(true);

      setMessage(
        result.message ||
        "Check your email for the OTP."
      );

      setSecondsLeft(60);

    } catch (err) {
      setError(
        err.message ||
        "Unable to request OTP."
      );

    } finally {
      setLoading(false);
    }
  }

  // ====================================================
  // VERIFY OTP AND RESET PASSWORD
  // ====================================================

  async function handleResetPassword(event) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (otp.length !== 6) {
      setError(
        "Enter the six-digit OTP."
      );
      return;
    }

    if (newPassword.length < 10) {
      setError(
        "Password must contain at least 10 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(
        "Both passwords must match."
      );
      return;
    }

    setLoading(true);

    try {
      const result =
        await publicUserRequest(
          "/password-reset/confirm",
          {
            email: email.trim(),
            otp: otp.trim(),
            newPassword,
          }
        );

      alert(
        result.message ||
        "Password reset successfully."
      );

      navigate("/user/login", {
        replace: true,
      });

    } catch (err) {
      setError(
        err.message ||
        "Password reset failed."
      );

    } finally {
      setLoading(false);
    }
  }

  // ====================================================
  // PAGE
  // ====================================================

  return (
    <main className="user-portal">
      <div className="user-portal-card">

        <Link
          className="user-portal-back"
          to="/user/login"
        >
          ← Back to Login
        </Link>

        <h1>Forgot Password?</h1>

        <p className="user-portal-intro">
          Reset your Jaiswal Vaivaahiki
          account password using your
          registered email address.
        </p>

        {/* ============================================
            EMAIL AND OTP REQUEST
        ============================================ */}

        <form onSubmit={handleRequestOtp}>

          <label htmlFor="resetEmail">
            Registered Email Address
          </label>

          <input
            id="resetEmail"
            type="email"
            autoComplete="email"
            placeholder="Enter registered email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setOtpRequested(false);
              setOtp("");
              setMessage("");
              setError("");
            }}
            required
            disabled={loading}
          />

          <button
            type="submit"
            className="user-portal-button"
            disabled={
              loading ||
              secondsLeft > 0 ||
              !email.trim()
            }
          >
            {loading
              ? "Processing..."
              : secondsLeft > 0
              ? `Request Again in ${secondsLeft}s`
              : otpRequested
              ? "Resend OTP"
              : "Send Reset OTP"}
          </button>

        </form>

        <p
          className="user-portal-intro"
          style={{
            fontSize: "13px",
            marginTop: "12px",
          }}
        >
          Maximum 5 password reset OTP
          requests per account in any
          24-hour period. Each OTP is valid
          for 10 minutes.
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

        {/* ============================================
            OTP VERIFICATION AND NEW PASSWORD
        ============================================ */}

        {otpRequested && (
          <form
            onSubmit={handleResetPassword}
            style={{
              marginTop: "25px",
            }}
          >
            <h2>Set New Password</h2>

            <label htmlFor="resetOtp">
              Six-Digit Email OTP
            </label>

            <input
              id="resetOtp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              placeholder="Enter six-digit OTP"
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

            <label htmlFor="newPassword">
              New Password
            </label>

            <input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              minLength={10}
              placeholder="At least 10 characters"
              value={newPassword}
              onChange={(event) =>
                setNewPassword(
                  event.target.value
                )
              }
              required
            />

            <label htmlFor="confirmPassword">
              Confirm New Password
            </label>

            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              minLength={10}
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(
                  event.target.value
                )
              }
              required
            />

            <p
              className="user-portal-intro"
              style={{
                fontSize: "13px",
              }}
            >
              The OTP expires after 10 minutes.
              Only 5 verification attempts
              are allowed per code.
            </p>

            <button
              type="submit"
              className="user-portal-button"
              disabled={
                loading ||
                otp.length !== 6 ||
                !newPassword ||
                !confirmPassword
              }
            >
              {loading
                ? "Resetting Password..."
                : "Reset Password"}
            </button>

          </form>
        )}

        <p className="user-portal-footer">
          Remembered your password?{" "}
          <Link to="/user/login">
            Login Here
          </Link>
        </p>

      </div>
    </main>
  );
}

export default ForgotPassword;
