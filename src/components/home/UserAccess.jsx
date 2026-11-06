
import { Link } from "react-router-dom";

import "./UserAccess.css";

function UserAccess() {
  return (
    <section className="home-user-access">
      <div className="home-user-access-inner">
        <h2>Submit Your Biodata</h2>

        <p>
          Create your account to submit your
          biodata for admin approval.
        </p>

        <p className="home-user-access-note">
          One biodata per account.
          Contact details and PDF access
          are controlled by the administrator.
        </p>

        <div className="home-user-access-actions">
          <Link
            to="/user/login"
            className="home-user-access-login"
          >
            User Login
          </Link>

          <Link
            to="/user/register"
            className="home-user-access-register"
          >
            Create Account
          </Link>
        </div>
      </div>
    </section>
  );
}

export default UserAccess;
