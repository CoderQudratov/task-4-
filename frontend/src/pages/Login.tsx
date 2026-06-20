import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Login_image from "../assets/login_page.png";
import { loginUser } from "../api/auth";
import { saveUser } from "../utils/authStore";

interface LoginForm {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as {
    message?: string;
    type?: "warning" | "success";
  } | null;
  const redirectMessage = state?.message ?? "";
  const redirectType = state?.type ?? "warning";

  const [formData, setFormData] = useState<LoginForm>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    setServerError("");
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    const email = formData.email.trim();
    const password = formData.password.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    const data = {
      email: formData.email.trim(),
      password: formData.password.trim(),
    };

    try {
      const response = await loginUser(data);
      saveUser(response.user);
      navigate("/dashboard", { replace: true });
    } catch (error: any) {
      setServerError(error?.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="container-fluid">
      <div className="row min-vh-100">
        {/* Auth Form */}
        <div className="col-lg-5 d-flex justify-content-center align-items-center py-5 py-lg-0">
          <div className="w-100 px-3 px-sm-4" style={{ maxWidth: "440px" }}>
            <h1 className="fw-bold text-primary mb-2">User Management</h1>
            <p className="text-secondary mb-4">Sign in to your account</p>

            {redirectMessage && (
              <div
                className={`alert alert-${redirectType} py-2 mb-4`}
                role="alert"
              >
                {redirectMessage}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="example@gmail.com"
                />
                {errors.email && (
                  <small className="text-danger">{errors.email}</small>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="••••••••"
                />
                {errors.password && (
                  <small className="text-danger">{errors.password}</small>
                )}
              </div>

              {serverError && (
                <div className="mb-3">
                  <small className="text-danger">{serverError}</small>
                </div>
              )}

              <div className="form-check mb-4">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="remember"
                />
                <label className="form-check-label" htmlFor="remember">
                  Remember me
                </label>
              </div>

              <button type="submit" className="btn btn-primary w-100">
                Sign In
              </button>
            </form>

            <div className="d-flex justify-content-between flex-wrap gap-2 mt-4">
              <Link to="/register" className="text-decoration-none">
                Create account
              </Link>
              <Link to="#" className="text-decoration-none">
                Forgot password?
              </Link>
            </div>
          </div>
        </div>

        {/* Image */}
        <div className="col-lg-7 d-none d-lg-flex justify-content-center align-items-center bg-light">
          <img
            src={Login_image}
            alt="login"
            className="img-fluid rounded"
            style={{ maxHeight: "85vh", objectFit: "cover" }}
          />
        </div>
      </div>
    </div>
  );
}

export default Login;
