import { useState } from "react";
import "./landing_page.css";
import logo from "./assets/wmsu-logo.png";

export function RegisterPage({ onNavigate }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    studentId: "",
    gradYear: "",
    college: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);
  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState("");

  const colleges = [
    "College of Science and Mathematics",
    "College of Engineering",
    "College of Computing Studies",
    "College of Teacher Education",
    "College of Nursing",
    "College of Liberal Arts",
    "College of Agriculture",
    "College of Architecture",
    "College of Public Administration and Development Studies",
    "College of Home Economics",
    "College of Criminal Justice Education",
    "College of Forestry and Environmental Studies",
    "College of Law",
    "College of Medicine",
  ];

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

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setStatusMessage("");
  }

  function validate() {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required.";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
    ) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!formData.gradYear.trim()) {
      newErrors.gradYear = "Graduation year is required.";
    } else {
      const year = Number(formData.gradYear);
      const currentYear = new Date().getFullYear();

      if (
        !Number.isInteger(year) ||
        year < 1904 ||
        year > currentYear + 10
      ) {
        newErrors.gradYear = "Please enter a valid graduation year.";
      }
    }

    if (!formData.college) {
      newErrors.college = "Please select your college/department.";
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms =
        "You must agree to the alumni network guidelines.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!validate()) {
      setStatusMessage("");
      return;
    }

    // Frontend validation only.
    // No account is created or data sent to a server.
    setStatusMessage(
      "Your information passed validation. Account registration is not yet connected."
    );
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
        <div className="auth_card auth_card_wide">
          <div className="auth_card_header">
            <span className="section_label">
              ALUMNI REGISTRATION
            </span>

            <h1>Join WMSU Alumni</h1>

            <p>
              Register your alumni profile to reconnect with classmates,
              receive university updates, and participate in alumni events.
            </p>
          </div>

          {statusMessage && (
            <div
              className="auth_alert auth_alert_info"
              role="status"
            >
              {statusMessage}
            </div>
          )}

          <form
            className="auth_form"
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="form_row">
              <div className="form_group">
                <label htmlFor="firstName" className="form_label">
                  First Name *
                </label>

                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  className={`form_input ${
                    errors.firstName ? "has_error" : ""
                  }`}
                  placeholder="Juan"
                  value={formData.firstName}
                  onChange={handleChange}
                  aria-invalid={!!errors.firstName}
                />

                {errors.firstName && (
                  <span className="field_error">
                    {errors.firstName}
                  </span>
                )}
              </div>

              <div className="form_group">
                <label htmlFor="lastName" className="form_label">
                  Last Name *
                </label>

                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  className={`form_input ${
                    errors.lastName ? "has_error" : ""
                  }`}
                  placeholder="Dela Cruz"
                  value={formData.lastName}
                  onChange={handleChange}
                  aria-invalid={!!errors.lastName}
                />

                {errors.lastName && (
                  <span className="field_error">
                    {errors.lastName}
                  </span>
                )}
              </div>
            </div>

            <div className="form_group">
              <label htmlFor="email" className="form_label">
                Email Address *
              </label>

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className={`form_input ${
                  errors.email ? "has_error" : ""
                }`}
                placeholder="juan.delacruz@example.com"
                value={formData.email}
                onChange={handleChange}
                aria-invalid={!!errors.email}
              />

              {errors.email && (
                <span className="field_error">
                  {errors.email}
                </span>
              )}
            </div>

            <div className="form_row">
              <div className="form_group">
                <label htmlFor="studentId" className="form_label">
                  Student / Alumni ID
                  <span className="form_label_hint">Optional</span>
                </label>

                <input
                  id="studentId"
                  name="studentId"
                  type="text"
                  className="form_input"
                  placeholder="e.g. 2020-00123"
                  value={formData.studentId}
                  onChange={handleChange}
                />
              </div>

              <div className="form_group">
                <label htmlFor="gradYear" className="form_label">
                  Graduation Year *
                </label>

                <input
                  id="gradYear"
                  name="gradYear"
                  type="number"
                  min="1904"
                  max={new Date().getFullYear() + 10}
                  className={`form_input ${
                    errors.gradYear ? "has_error" : ""
                  }`}
                  placeholder="e.g. 2024"
                  value={formData.gradYear}
                  onChange={handleChange}
                  aria-invalid={!!errors.gradYear}
                />

                {errors.gradYear && (
                  <span className="field_error">
                    {errors.gradYear}
                  </span>
                )}
              </div>
            </div>

            <div className="form_group">
              <label htmlFor="college" className="form_label">
                College / Department *
              </label>

              <select
                id="college"
                name="college"
                className={`form_select ${
                  errors.college ? "has_error" : ""
                }`}
                value={formData.college}
                onChange={handleChange}
                aria-invalid={!!errors.college}
              >
                <option value="">Select your college</option>

                {colleges.map((college) => (
                  <option key={college} value={college}>
                    {college}
                  </option>
                ))}
              </select>

              {errors.college && (
                <span className="field_error">
                  {errors.college}
                </span>
              )}
            </div>

            <div className="form_row">
              <div className="form_group">
                <label htmlFor="password" className="form_label">
                  Password *
                </label>

                <div className="password_wrapper">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    className={`form_input ${
                      errors.password ? "has_error" : ""
                    }`}
                    placeholder="Min 8 characters"
                    value={formData.password}
                    onChange={handleChange}
                    aria-invalid={!!errors.password}
                  />

                  <button
                    type="button"
                    className="password_toggle_btn"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                {errors.password && (
                  <span className="field_error">
                    {errors.password}
                  </span>
                )}
              </div>

              <div className="form_group">
                <label
                  htmlFor="confirmPassword"
                  className="form_label"
                >
                  Confirm Password *
                </label>

                <div className="password_wrapper">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={
                      showConfirmPassword ? "text" : "password"
                    }
                    autoComplete="new-password"
                    className={`form_input ${
                      errors.confirmPassword ? "has_error" : ""
                    }`}
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    aria-invalid={!!errors.confirmPassword}
                  />

                  <button
                    type="button"
                    className="password_toggle_btn"
                    onClick={() =>
                      setShowConfirmPassword((prev) => !prev)
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>

                {errors.confirmPassword && (
                  <span className="field_error">
                    {errors.confirmPassword}
                  </span>
                )}
              </div>
            </div>

            <div className="form_checkbox_group">
              <input
                id="agreeTerms"
                name="agreeTerms"
                type="checkbox"
                checked={formData.agreeTerms}
                onChange={handleChange}
                aria-invalid={!!errors.agreeTerms}
              />

              <label htmlFor="agreeTerms">
                I agree to the WMSU Alumni Network Terms and confirm
                that the information provided is accurate.
              </label>
            </div>

            {errors.agreeTerms && (
              <div className="field_error">
                {errors.agreeTerms}
              </div>
            )}

            <button
              type="submit"
              className="btn btn_primary btn_full"
            >
              Create Alumni Account <span>→</span>
            </button>
          </form>

          <div className="auth_card_footer">
            Already registered?{" "}
            <a
              href="/login_page.jsx"
              onClick={(e) =>
                handleNavigate(e, "/login_page.jsx")
              }
            >
              Log in to your account
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

export default RegisterPage;