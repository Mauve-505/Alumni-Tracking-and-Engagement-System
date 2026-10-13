import { useState } from "react";
import "./landing_page.css";
import logo from "./assets/wmsu-logo.png";

export function LoginPage({ onNavigate }) {
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState(null);

  function handleNavigate(e, path) {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(path);
    }
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear field-level error as user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    if (statusMessage) {
      setStatusMessage(null);
    }
  }

  function validate() {
    const newErrors = {};

    if (!formData.identifier.trim()) {
      newErrors.identifier = "Please enter your email or username.";
    }

    if (!formData.password) {
      newErrors.password = "Please enter your password.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    // Client-side authentication handling
    // As the backend authentication service is not connected to the frontend yet,
    // we clearly inform the user rather than simulating fake success or storing credentials.
    setStatusMessage({
      type: "info",
      text: "Form validation passed. Backend authentication endpoint is not yet connected. Ready for backend API integration.",
    });
  }

  return (
    <div className="auth_page">
      <header className="auth_header">
        <a
          href="/"
          className="brand"
          onClick={(e) => handleNavigate(e, "/")}
          aria-label="WMSU Alumni Home"
        >
          <img src={logo} alt="WMSU logo" />
          <span>WMSU Alumni</span>
        </a>

        <a
          href="/"
          className="auth_back_btn"
          onClick={(e) => handleNavigate(e, "/")}
        >
          ← Back to Home
        </a>
      </header>

      <main className="auth_main">
        <div className="auth_card">
          <div className="auth_card_header">
            <span className="section_label">ALUMNI PORTAL</span>
            <h1>Welcome Back</h1>
            <p>
              Sign in with your email or username to access your alumni account
              and community features.
            </p>
          </div>

          {statusMessage && (
            <div
              className={`auth_alert auth_alert_${statusMessage.type}`}
              role="alert"
            >
              {statusMessage.text}
            </div>
          )}

          <form className="auth_form" onSubmit={handleSubmit} noValidate>
            <div className="form_group">
              <label htmlFor="identifier" className="form_label">
                <span>Email Address or Username</span>
              </label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                autoComplete="username"
                className={`form_input ${errors.identifier ? "has_error" : ""}`}
                placeholder="e.g. juan.delacruz@wmsu.edu.ph"
                value={formData.identifier}
                onChange={handleChange}
                aria-invalid={!!errors.identifier}
                aria-describedby={
                  errors.identifier ? "identifier-error" : undefined
                }
              />
              {errors.identifier && (
                <span id="identifier-error" className="field_error">
                  {errors.identifier}
                </span>
              )}
            </div>

            <div className="form_group">
              <label htmlFor="password" className="form_label">
                <span>Password</span>
              </label>
              <div className="password_wrapper">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className={`form_input ${errors.password ? "has_error" : ""}`}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  aria-invalid={!!errors.password}
                  aria-describedby={
                    errors.password ? "password-error" : undefined
                  }
                />
                <button
                  type="button"
                  className="password_toggle_btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && (
                <span id="password-error" className="field_error">
                  {errors.password}
                </span>
              )}
            </div>

            <div className="form_checkbox_group">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              <label htmlFor="rememberMe">Remember me on this device</label>
            </div>

            <button type="submit" className="btn btn_primary btn_full">
              Log In to Account <span>→</span>
            </button>
          </form>

          <div className="auth_card_footer">
            Don't have an alumni account yet?
            <a
              href="/register_page.jsx"
              onClick={(e) => handleNavigate(e, "/register_page.jsx")}
            >
              Sign Up
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

export default LoginPage;
