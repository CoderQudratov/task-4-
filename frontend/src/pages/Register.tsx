import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Login_image from "../assets/login_page.png";
import { registerUser } from "../api/auth";

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
}

interface RegisterForm {
  name: string;
  email: string;
  password: string;
}

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<RegisterForm>({
    name: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState("");
  const [agree, setAgree] = useState(false);
  const [agreeError, setAgreeError] = useState("");
  const [verifyUrl, setVerifyUrl] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    setServerError("");
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    const name = formData.name.trim();
    const email = formData.email.trim();
    const password = formData.password.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name) {
      newErrors.name = "Name is required";
    } else if (name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    } else if (name.length > 50) {
      newErrors.name = "Name must be less than 50 characters";
    }

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length > 100) {
      newErrors.password = "Password is too long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    if (!agree) {
      setAgreeError("You must agree to the Terms and Conditions");
      return;
    }

    setAgreeError("");

    const data = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password.trim(),
    };

    try {
      const result = await registerUser(data);
      if (result.verifyUrl) {
        setVerifyUrl(result.verifyUrl);
      } else {
        navigate("/login", {
          replace: true,
          state: {
            message:
              "Registration successful! Please verify your email, then sign in.",
            type: "success",
          },
        });
      }
    } catch (error: any) {
      setServerError(
        error?.response?.data?.message ||
          "Registration failed. Please try again.",
      );
    }
  };

  return (
    <div className="container-fluid">
      <div className="row min-vh-100">
        {/* Auth Form */}
        <div className="col-lg-5 d-flex justify-content-center align-items-center py-5 py-lg-0">
          <div className="w-100 px-3 px-sm-4" style={{ maxWidth: "440px" }}>
            <h1 className="fw-bold text-primary mb-2">User Management</h1>
            <p className="text-secondary mb-4">Create your account</p>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Your name"
                />
                {errors.name && (
                  <small className="text-danger">{errors.name}</small>
                )}
              </div>

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

              <div className="mb-4">
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

              <div className="form-check mb-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="agree"
                  checked={agree}
                  onChange={(e) => {
                    setAgree(e.target.checked);
                    setAgreeError("");
                  }}
                />
                <label className="form-check-label" htmlFor="agree">
                  I agree to Terms and Conditions
                </label>
              </div>

              {agreeError && (
                <small className="text-danger d-block mb-2">{agreeError}</small>
              )}

              {serverError && (
                <small className="text-danger d-block mb-2">
                  {serverError}
                </small>
              )}

              <button type="submit" className="btn btn-primary w-100 mt-2">
                Register
              </button>
            </form>

            {verifyUrl ? (
              <div className="mt-4 text-center">
                <p className="text-success fw-semibold">
                  Registration successful. Click button below to verify email.
                </p>
                <a
                  href={verifyUrl}
                  className="btn btn-success w-100"
                >
                  Click This Button to Verify Email
                </a>
              </div>
            ) : (
              <div className="text-center mt-4">
                <span className="text-secondary">Already have an account?</span>
                <Link
                  to="/login"
                  className="text-decoration-none fw-semibold ms-2"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Image */}
        <div className="col-lg-7 d-none d-lg-flex justify-content-center align-items-center bg-light">
          <img
            src={Login_image}
            alt="Register"
            className="img-fluid rounded"
            style={{ maxHeight: "85vh", objectFit: "cover" }}
          />
        </div>
      </div>
    </div>
  );
}

export default Register;
