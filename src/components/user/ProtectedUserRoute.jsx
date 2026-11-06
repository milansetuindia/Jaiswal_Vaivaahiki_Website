
import { useEffect, useState } from "react";
import {
  Navigate,
  Outlet,
} from "react-router-dom";

import {
  getUserSession,
} from "../../utils/userApi";

function ProtectedUserRoute() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let active = true;

    async function checkSession() {
      try {
        const result = await getUserSession();

        if (active) {
          setUser(result);
        }
      } catch {
        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    checkSession();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="user-portal-loading">
        Checking your login...
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/user/login"
        replace
      />
    );
  }

  return <Outlet context={{ user }} />;
}

export default ProtectedUserRoute;
