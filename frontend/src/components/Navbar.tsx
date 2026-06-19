import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { logoutUser } from "../api/auth";
import { getStoredUser, clearUser } from "../utils/authStore";

function Navbar() {
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const userName = getStoredUser()?.name ?? "";

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutUser();
    } catch {
      // Logout
    } finally {
      clearUser();
      navigate("/login", {
        replace: true,
        state: { message: "You have been logged out." },
      });
    }
  };

  return (
    <nav className="navbar bg-white border-bottom px-2 px-md-4 py-2">
      <div className="w-100 d-flex flex-column flex-sm-row align-items-center justify-content-sm-between gap-2">
        <span className="navbar-brand fw-semibold mb-0">User Management</span>

        <div className="d-flex flex-column flex-sm-row align-items-center gap-2">
          {userName && (
            <span
              className="text-muted text-truncate"
              style={{ fontSize: "0.9rem", maxWidth: "160px" }}
              title={userName}
            >
              {userName}
            </span>
          )}

          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
