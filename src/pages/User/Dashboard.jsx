
import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useOutletContext,
} from "react-router-dom";

import {
  logoutUser,
  userFetch,
} from "../../utils/userApi";

import "./UserPortal.css";

function Dashboard() {
  const navigate = useNavigate();

  const { user } = useOutletContext();




  // ======================================================
  // CONTACT ADMIN ON WHATSAPP
  // ======================================================

  const adminWhatsappNumber = "917050510511";

  const contactAdminOnWhatsapp = () => {
    const profileNumber =
      biodata?.profileNumber || "Not assigned";

    const approvalStatus =
      biodata?.approvalStatus || "pending";

    const whatsappMessage =
      `🙏 Namaste Jaiswal Vaivaahiki Admin,\n\n` +
      `I have submitted my biodata on the Jaiswal Vaivaahiki website.\n\n` +
      `Profile Number: ${profileNumber}\n` +
      `Approval Status: ${approvalStatus}\n\n` +
      `Kindly review my biodata and help me with the approval process.\n\n` +
      `Thank you.`;

    // Same WhatsApp opening method used
    // on your existing Biodata Profile page.

    const adminWhatsappUrl =
      `whatsapp://send?phone=${adminWhatsappNumber}` +
      `&text=${encodeURIComponent(whatsappMessage)}`;

    window.location.href = adminWhatsappUrl;
  };



  const [biodata, setBiodata] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [loggingOut, setLoggingOut] =
    useState(false);

  const [error, setError] =
    useState("");

  // ====================================================
  // FETCH OWN BIODATA STATUS
  // ====================================================

  useEffect(() => {
    let active = true;

    async function loadBiodata() {
      try {
        const response = await userFetch(
          "/api/user-biodata/me"
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
            "Unable to load biodata."
          );
        }

        if (active) {
          setBiodata(result.biodata);
        }
      } catch (err) {
        if (active) {
          setError(err.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadBiodata();

    return () => {
      active = false;
    };
  }, []);

  // ====================================================
  // LOGOUT
  // ====================================================

  async function handleLogout() {
    setError("");
    setLoggingOut(true);

    try {
      await logoutUser();

      navigate("/user/login", {
        replace: true,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <main className="user-portal">
      <div className="user-portal-card user-dashboard-card">

        <Link
          className="user-portal-back"
          to="/"
        >
          ← Back to Home
        </Link>

        <h1>My Dashboard</h1>

        <p className="user-portal-intro">
          Welcome, {user.fullName}.
        </p>

        <div className="user-dashboard-details">
          <p>
            <strong>Email:</strong>{" "}
            {user.email}
          </p>

          <p>
            <strong>Mobile:</strong>{" "}
            {user.mobile}
          </p>
        </div>

        <div className="user-dashboard-notice">
          <h2>My Biodata</h2>

          {loading ? (
            <p>Loading your biodata...</p>
          ) : error ? (
            <p className="user-portal-error">
              {error}
            </p>
          ) : biodata ? (
            <>
              <p>
                <strong>Profile Number:</strong>{" "}
                {biodata.profileNumber}
              </p>

              <p>
                <strong>Name:</strong>{" "}
                {biodata.name}
              </p>

              <p>
                <strong>Approval Status:</strong>{" "}
                {biodata.approvalStatus === "approved"
                  ? "Approved"
                  : biodata.approvalStatus === "rejected"
                  ? "Rejected"
                  : "Pending Admin Review"}
              </p>

              <p>
                You cannot edit or delete
                your biodata directly.
                Contact the administrator
                if corrections or removal
                are required.
              </p>

              {biodata.approvalStatus === "approved" && (
                <Link
                  to={`/biodata/${biodata._id}`}
                >
                  View Public Profile
                </Link>
              )}
            </>
          ) : (
            <>
              <p>
                You have not submitted
                a biodata yet.
              </p>

              <p>
                You may submit one biodata.
                It will appear publicly only
                after admin approval.
              </p>

              <Link
                className="user-portal-button"
                to="/user/biodata/add"
                style={{
                  textAlign: "center",
                  textDecoration: "none",
                }}
              >
                Add Biodata
              </Link>
            </>
          )}
        </div>


        {/* ======================================================
            CONTACT ADMIN ON WHATSAPP
        ====================================================== */}

        {biodata && (
          <button
            type="button"
            onClick={contactAdminOnWhatsapp}
            className="user-dashboard-whatsapp-btn"
          >
            <span
              aria-hidden="true"
              style={{ fontSize: "21px" }}
            >
              💬
            </span>

            Contact Admin on WhatsApp
          </button>
        )}

        {/* ======================================================
            LOGOUT BUTTON
        ====================================================== */}

        <button
          className="user-portal-secondary"
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut
            ? "Logging Out..."
            : "Logout"}
        </button>


      </div>
    </main>
  );
}

export default Dashboard;
