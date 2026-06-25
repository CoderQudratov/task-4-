import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getMe } from "../api/auth";
import { getStoredUser, saveUser, clearUser } from "../utils/authStore";
import Loader from "../components/Loader";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [status, setStatus] = useState<
    "loading" | "authenticated" | "unauthenticated"
  >(() => (getStoredUser() ? "authenticated" : "loading"));

  useEffect(() => {
    let cancelled = false;

    getMe()
      .then((user) => {
        if (!cancelled) {
          saveUser(user);
          setStatus("authenticated");
        }
      })
      .catch(() => {
        if (!cancelled) {
          clearUser();
          setStatus("unauthenticated");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "loading") return <Loader />;

  if (status === "unauthenticated") {
    return (
      <Navigate
        to="/login"
        replace
        state={{ message: "Please sign in to continue." }}
      />
    );
  }

  return <>{children}</>;
}

export default ProtectedRoute;
