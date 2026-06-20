import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { verifyEmailToken } from "../api/auth";
import Loader from "../components/Loader";

function Verify() {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setMessage("Invalid verification link.");
      setStatus("error");
      return;
    }

    verifyEmailToken(token)
      .then((res) => {
        setMessage(res.message || "Email verified successfully!");
        setStatus("success");
      })
      .catch((err: unknown) => {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ??
          "Verification failed. The link may be expired or invalid.";
        setMessage(msg);
        setStatus("error");
      });
  }, [token]);

  if (status === "loading") return <Loader />;

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="text-center" style={{ maxWidth: "440px" }}>
        {status === "success" ? (
          <>
            <div className="mb-3 text-success" style={{ fontSize: "3rem" }}>
              ✓
            </div>
            <h2 className="fw-bold mb-3">Email Verified</h2>
            <p className="text-muted mb-4">{message}</p>
            <Link to="/login" className="btn btn-primary">
              Sign In
            </Link>
          </>
        ) : (
          <>
            <div className="mb-3 text-danger" style={{ fontSize: "3rem" }}>
              ✕
            </div>
            <h2 className="fw-bold mb-3">Verification Failed</h2>
            <p className="text-muted mb-4">{message}</p>
            <Link to="/login" className="btn btn-outline-secondary">
              Back to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default Verify;
