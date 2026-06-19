import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getMe } from "../api/auth";
import { saveUser } from "../utils/authStore";
import Loader from "../components/Loader";

interface PublicRouteProps {
  children: React.ReactNode;
}

function PublicRoute({ children }: PublicRouteProps) {
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

  useEffect(() => {
    getMe()
      .then((user) => {
        saveUser(user);
        setStatus("authenticated");
      })
      .catch(() => {
        setStatus("unauthenticated");
      });
  }, []);

  if (status === "loading") return <Loader />;

  if (status === "authenticated") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export default PublicRoute;
