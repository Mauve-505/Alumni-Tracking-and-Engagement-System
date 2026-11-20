import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import "./AlumniSurvey.css";
import "./ContentManagement.css";
import logo from "./assets/wmsu-logo.png";
import {
  WMSU_ACADEMIC_DATA,
  WMSU_COLLEGES,
  ALL_COURSES,
  GRADUATION_YEARS,
  EMPLOYMENT_STATUSES,
  findAcademicInfoByCourse,
  getCoursesByCollege,
  getDepartmentsByCollege,
} from "./wmsuData.js";
import { submitSurveyCensus } from "./contentStore.js";

/**
 * WMSU ALUMNI SURVEY & CENSUS SECTION
 * ============================================================================
 * Official census questionnaire enabling alumni across all colleges to update
 * their demographic, academic, and career tracer information.
 *
 * NOTE ON DROPDOWNS:
 * The Degree or Course Completed, College or Department, and Graduation Year
 * fields use verified WMSU predefined lists from wmsuData.js.
 * Course selection dynamically locks and populates the matching College and
 * Department options to ensure data integrity.
 *
 * BACKEND CONNECTION POINT:
 * Groupmates: When connecting the backend:
 * 1. Submit survey responses to:
 *    POST /api/alumni/survey-census
 *    or PUT /api/alumni/:profileId to update an existing registered alumnus.
 * 2. Retrieve existing pre-filled alumnus data using GET /api/alumni/me
 * 3. Predefined course/college lists can be loaded from GET /api/colleges
 * ============================================================================
 */

export default function AlumniSurveyPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    contactNumber: "",
    course: "",
    college: "",
    department: "",
    graduationYear: "",
    employmentStatus: "",
    occupation: "",
    company: "",
    location: "",
    feedbackSuggestions: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  // Available courses dependent on chosen college (if college chosen first)
  const availableCourses = useMemo(() => {
    if (!formData.college) return ALL_COURSES;
    return getCoursesByCollege(formData.college);
  }, [formData.college]);

  // Available departments dependent on chosen college
  const availableDepartments = useMemo(() => {
    if (!formData.college) return [];
    return getDepartmentsByCollege(formData.college);
  }, [formData.college]);

  // Handle Course Selection -> Auto-set College and Department
  const handleCourseChange = (e) => {
    const selectedCourseName = e.target.value;
    if (!selectedCourseName) {
      setFormData((prev) => ({
        ...prev,
        course: "",
      }));
      return;
    }

    const academicInfo = findAcademicInfoByCourse(selectedCourseName);
    if (academicInfo) {
      setFormData((prev) => ({
        ...prev,
        course: academicInfo.courseName,
        college: academicInfo.collegeName,
        department: academicInfo.departmentName,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        course: selectedCourseName,
      }));
    }

    if (errors.course || errors.college || errors.department) {
      setErrors((prev) => ({
        ...prev,
        course: null,
        college: null,
        department: null,
      }));
    }
  };

  // Handle College Selection -> Filter courses & reset course if mismatched
  const handleCollegeChange = (e) => {
    const selectedCollege = e.target.value;
    const currentCourseInfo = findAcademicInfoByCourse(formData.course);

    // If current course does not belong to newly selected college, clear course
    const shouldResetCourse =
      currentCourseInfo && currentCourseInfo.collegeName !== selectedCollege;

    const depts = getDepartmentsByCollege(selectedCollege);

    setFormData((prev) => ({
      ...prev,
      college: selectedCollege,
      course: shouldResetCourse ? "" : prev.course,
      department: depts.length === 1 ? depts[0] : "",
    }));

    if (errors.college) {
      setErrors((prev) => ({ ...prev, college: null }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Validate form submission
  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required.";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required.";

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = "Contact number is required.";
    }

    // Educational Background Requirements (MUST BE REQUIRED)
    if (!formData.course) {
      newErrors.course = "Please select your course or degree program.";
    }
    if (!formData.college) {
      newErrors.college = "Please select your college or department.";
    }
    if (!formData.graduationYear) {
      newErrors.graduationYear = "Please select your graduation year.";
    }

    // Employment
    if (!formData.employmentStatus) {
      newErrors.employmentStatus = "Please select your employment status.";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Current location (City, Country) is required.";
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      window.scrollTo({ top: 300, behavior: "smooth" });
      return;
    }

    // BACKEND CONNECTION POINT:
    // Groupmates: Connect to POST /api/alumni/survey-census
    // with the validated payload below:
    const payload = {
      full_name: `${formData.firstName} ${formData.middleName ? formData.middleName + " " : ""}${formData.lastName}`.trim(),
      first_name: formData.firstName,
      middle_name: formData.middleName,
      last_name: formData.lastName,
      email: formData.email,
      contact_number: formData.contactNumber,
      course_completed: formData.course,
      college: formData.college,
      department: formData.department,
      graduation_year: formData.graduationYear,
      employment_status: formData.employmentStatus,
      occupation: formData.occupation || "Not specified",
      company: formData.company || "Not specified",
      current_location: formData.location,
      feedback: formData.feedbackSuggestions,
    };

    submitSurveyCensus(payload);
    setSubmittedData(payload);
    setIsSubmitted(true);
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  const handleReset = () => {
    setFormData({
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      contactNumber: "",
      course: "",
      college: "",
      department: "",
      graduationYear: "",
      employmentStatus: "",
      occupation: "",
      company: "",
      location: "",
      feedbackSuggestions: "",
    });
    setErrors({});
    setIsSubmitted(false);
    setSubmittedData(null);
  };

  return (
    <div className="census-page">
      {/* HEADER HERO BANNER */}
      <section className="census-hero">
        <div className="census-hero-content">
          <span className="census-eyebrow">
            Western Mindanao State University • Alumni Tracer &amp; Engagement
          </span>
          <h1>WMSU Alumni Survey &amp; Census 2026</h1>
          <p>
            Help your Alma Mater track the career achievements, educational milestones,
            and whereabouts of Crimson graduates worldwide. Your response guides institutional
            accreditation, curriculum innovation, and alumni networking opportunities.
          </p>
        </div>
      </section>

      <div className="census-container">
        {isSubmitted && submittedData ? (
          /* CONFIRMATION / FEEDBACK STATE */
          <div className="census-success-card fade-in">
            <div className="census-success-icon">✓</div>
            <h2>Census Response Submitted!</h2>
            <p>
              Thank you, <strong>{submittedData.full_name}</strong>. Your alumni tracer information has been
              successfully captured in the frontend state session. Your Alma Mater appreciates your continued support!
            </p>

            <div className="census-summary-table">
              <div className="census-summary-row">
                <span className="census-summary-label">Alumnus Name</span>
                <span className="census-summary-val">{submittedData.full_name}</span>
              </div>
              <div className="census-summary-row">
                <span className="census-summary-label">Email Address</span>
                <span className="census-summary-val">{submittedData.email}</span>
              </div>
              <div className="census-summary-row">
                <span className="census-summary-label">Contact Number</span>
                <span className="census-summary-val">{submittedData.contact_number}</span>
              </div>
              <div className="census-summary-row">
                <span className="census-summary-label">Degree Completed</span>
                <span className="census-summary-val">{submittedData.course_completed}</span>
              </div>
              <div className="census-summary-row">
                <span className="census-summary-label">College / Dept</span>
                <span className="census-summary-val">
                  {submittedData.college}
                  {submittedData.department ? ` (${submittedData.department})` : ""}
                </span>
              </div>
              <div className="census-summary-row">
                <span className="census-summary-label">Batch / Year</span>
                <span className="census-summary-val">Class of {submittedData.graduation_year}</span>
              </div>
              <div className="census-summary-row">
                <span className="census-summary-label">Employment Status</span>
                <span className="census-summary-val" style={{ textTransform: "capitalize" }}>
                  {submittedData.employment_status.replace(/_/g, " ")}
                </span>
              </div>
              {submittedData.occupation !== "Not specified" && (
                <div className="census-summary-row">
                  <span className="census-summary-label">Current Role &amp; Org</span>
                  <span className="census-summary-val">
                    {submittedData.occupation} at {submittedData.company}
                  </span>
                </div>
              )}
              <div className="census-summary-row">
                <span className="census-summary-label">Current Location</span>
                <span className="census-summary-val">{submittedData.current_location}</span>
              </div>
            </div>

            <p style={{ fontSize: "13px", color: "#64748b" }}>
              <em>Note: As this is running in frontend-only mode, data is preserved in this browser session.</em>
            </p>

            <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "24px" }}>
              <button
                type="button"
                className="census-btn-reset"
                onClick={handleReset}
              >
                Submit Another Response
              </button>
              <Link to="/home" className="census-btn-submit" style={{ textDecoration: "none" }}>
                Return to Alumni Portal
              </Link>
            </div>
          </div>
        ) : (
          /* CENSUS & SURVEY FORM */
          <form className="census-card" onSubmit={handleSubmit} noValidate>
            {/* SECTION 1: PERSONAL IDENTIFICATION */}
            <div className="census-section-title">
              <span className="census-section-number">1</span>
              <span>Personal Information</span>
            </div>

            <div className="census-grid-3">
              <div className="census-field">
                <label htmlFor="firstName">
                  First Name <span className="req">*</span>
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="e.g. Maria"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
                {errors.firstName && <span className="census-field-error">{errors.firstName}</span>}
              </div>

              <div className="census-field">
                <label htmlFor="middleName">Middle Name / Initial</label>
                <input
                  id="middleName"
                  name="middleName"
                  type="text"
                  placeholder="e.g. A."
                  value={formData.middleName}
                  onChange={handleChange}
                />
              </div>

              <div className="census-field">
                <label htmlFor="lastName">
                  Last Name <span className="req">*</span>
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="e.g. Santos"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
                {errors.lastName && <span className="census-field-error">{errors.lastName}</span>}
              </div>
            </div>

            <div className="census-grid-2">
              <div className="census-field">
                <label htmlFor="email">
                  Email Address <span className="req">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="e.g. maria.santos@gmail.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                {errors.email && <span className="census-field-error">{errors.email}</span>}
              </div>

              <div className="census-field">
                <label htmlFor="contactNumber">
                  Contact Number <span className="req">*</span>
                </label>
                <input
                  id="contactNumber"
                  name="contactNumber"
                  type="tel"
                  placeholder="e.g. +63 917 123 4567"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  required
                />
                {errors.contactNumber && (
                  <span className="census-field-error">{errors.contactNumber}</span>
                )}
              </div>
            </div>

            {/* SECTION 2: WMSU EDUCATIONAL BACKGROUND DROPDOWNS (STRICT REQUIREMENT) */}
            <div className="census-section-title">
              <span className="census-section-number">2</span>
              <span>WMSU Educational Background</span>
            </div>

            <div className="census-dep-box">
              <div className="census-dep-info">
                <span>ℹ️</span>
                <span>
                  Selecting your course will automatically identify and link your official College and Department.
                </span>
              </div>

              {/* A. DEGREE OR COURSE COMPLETED (PREDEFINED DROPDOWN) */}
              <div className="census-field">
                <label htmlFor="course">
                  Degree or Course Completed <span className="req">*</span>
                </label>
                <select
                  id="course"
                  name="course"
                  value={formData.course}
                  onChange={handleCourseChange}
                  required
                >
                  <option value="">Select your course</option>
                  {formData.college ? (
                    availableCourses.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))
                  ) : (
                    WMSU_ACADEMIC_DATA.map((col) => (
                      <optgroup key={col.collegeId} label={col.collegeName}>
                        {col.courses.map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </optgroup>
                    ))
                  )}
                </select>
                {errors.course && <span className="census-field-error">{errors.course}</span>}
                <span className="census-field-hint">
                  Official list of academic degree programs offered by Western Mindanao State University.
                </span>
              </div>

              {/* B. COLLEGE OR DEPARTMENT (PREDEFINED DROPDOWN & DEPENDENT) */}
              <div className="census-grid-2">
                <div className="census-field">
                  <label htmlFor="college">
                    College <span className="req">*</span>
                  </label>
                  <select
                    id="college"
                    name="college"
                    value={formData.college}
                    onChange={handleCollegeChange}
                    required
                  >
                    <option value="">Select your college or department</option>
                    {WMSU_COLLEGES.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>
                  {errors.college && <span className="census-field-error">{errors.college}</span>}
                </div>

                <div className="census-field">
                  <label htmlFor="department">Department / Major</label>
                  <select
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                  >
                    <option value="">
                      {availableDepartments.length > 0
                        ? "Select specific department"
                        : "Department auto-linked to course"}
                    </option>
                    {availableDepartments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* C. GRADUATION YEAR (PREDEFINED DROPDOWN) */}
              <div className="census-field" style={{ maxWidth: "360px" }}>
                <label htmlFor="graduationYear">
                  Graduation Year <span className="req">*</span>
                </label>
                <select
                  id="graduationYear"
                  name="graduationYear"
                  value={formData.graduationYear}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select graduation year</option>
                  {GRADUATION_YEARS.map((yr) => (
                    <option key={yr} value={yr}>
                      Class of {yr}
                    </option>
                  ))}
                </select>
                {errors.graduationYear && (
                  <span className="census-field-error">{errors.graduationYear}</span>
                )}
                <span className="census-field-hint">
                  Includes graduation batches from 1970 up to current year.
                </span>
              </div>
            </div>

            {/* SECTION 3: EMPLOYMENT & OCCUPATION */}
            <div className="census-section-title">
              <span className="census-section-number">3</span>
              <span>Employment &amp; Career Information</span>
            </div>

            <div className="census-grid-2">
              <div className="census-field">
                <label htmlFor="employmentStatus">
                  Current Employment Status <span className="req">*</span>
                </label>
                <select
                  id="employmentStatus"
                  name="employmentStatus"
                  value={formData.employmentStatus}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select employment status</option>
                  {EMPLOYMENT_STATUSES.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
                {errors.employmentStatus && (
                  <span className="census-field-error">{errors.employmentStatus}</span>
                )}
              </div>

              <div className="census-field">
                <label htmlFor="occupation">Current Occupation / Position</label>
                <input
                  id="occupation"
                  name="occupation"
                  type="text"
                  placeholder="e.g. Lead Software Engineer, Clinical Nurse, Teacher III"
                  value={formData.occupation}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="census-grid-2">
              <div className="census-field">
                <label htmlFor="company">Company or Organization Name</label>
                <input
                  id="company"
                  name="company"
                  type="text"
                  placeholder="e.g. DepEd, ZCMC, SGV &amp; Co., Freelance"
                  value={formData.company}
                  onChange={handleChange}
                />
              </div>

              <div className="census-field">
                <label htmlFor="location">
                  Current Location (City, Country) <span className="req">*</span>
                </label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  placeholder="e.g. Zamboanga City, Philippines / Dubai, UAE"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
                {errors.location && <span className="census-field-error">{errors.location}</span>}
              </div>
            </div>

            {/* SECTION 4: FEEDBACK */}
            <div className="census-field">
              <label htmlFor="feedbackSuggestions">
                Suggestions / Recommendations for WMSU Alumni Affairs
              </label>
              <textarea
                id="feedbackSuggestions"
                name="feedbackSuggestions"
                rows={3}
                placeholder="Share your thoughts on alumni programs, mentoring initiatives, or campus updates..."
                value={formData.feedbackSuggestions}
                onChange={handleChange}
              />
            </div>

            {/* SUBMIT BUTTON ROW */}
            <div className="census-submit-wrap">
              <button
                type="button"
                className="census-btn-reset"
                onClick={handleReset}
              >
                Reset Form
              </button>
              <button type="submit" className="census-btn-submit">
                Submit Alumni Census
              </button>
            </div>
          </form>
        )}
      </div>

      {/* CONSISTENT UNIFIED FOOTER */}
      <footer className="footer" id="contact">
        <div className="footer_main">
          <div className="footer_brand">
            <Link to="/" className="brand footer_logo">
              <img src={logo} alt="WMSU logo" />
              <span>WMSU Alumni</span>
            </Link>
            <p>
              Keeping generations of WMSU graduates connected, informed, and engaged across the globe.
            </p>
          </div>

          <div className="footer_links">
            <h3>Explore</h3>
            <Link to="/home">Alumni Portal</Link>
            <Link to="/news">News &amp; Updates</Link>
            <Link to="/events">Events</Link>
            <Link to="/directory">Alumni Directory</Link>
          </div>

          <div className="footer_links">
            <h3>Participation</h3>
            <Link to="/survey">Alumni Census</Link>
            <Link to="/login">Login / Sign Up</Link>
            <Link to="/register">Join Community</Link>
          </div>
        </div>

        <div className="footer_bottom">
          <p>© 2026 WMSU Alumni. All rights reserved.</p>
          <p>Western Mindanao State University • Normal Road, Baliwasan, Zamboanga City</p>
        </div>
      </footer>
    </div>
  );
}
