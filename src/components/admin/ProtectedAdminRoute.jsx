
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

import {
  checkAdminSession,
} from "../../utils/adminApi";

function ProtectedAdminRoute() {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let active = true;

    checkAdminSession().then((valid) => {
      if (active) {
        setStatus(
          valid ? "authenticated" : "unauthenticated"
        );
      }
    });

    return () => {
      active = false;
    };
  }, []);

  if (status === "checking") {
    return (
      <div style={{
        padding: "40px",
        textAlign: "center",
      }}>
        Verifying admin session...
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <Navigate to="/admin/login" replace />
    );
  }

  return <Outlet />;
}

export default ProtectedAdminRoute;
