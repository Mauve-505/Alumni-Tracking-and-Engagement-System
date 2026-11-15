import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './register.css';

const COUNTRY_CODES = [
  { code: '+63', label: 'PH +63' },
  { code: '+1', label: 'US/CA +1' },
  { code: '+44', label: 'UK +44' },
  { code: '+61', label: 'AU +61' },
  { code: '+65', label: 'SG +65' },
  { code: '+60', label: 'MY +60' },
  { code: '+62', label: 'ID +62' },
  { code: '+66', label: 'TH +66' },
  { code: '+84', label: 'VN +84' },
  { code: '+81', label: 'JP +81' },
  { code: '+82', label: 'KR +82' },
  { code: '+86', label: 'CN +86' },
  { code: '+852', label: 'HK +852' },
  { code: '+91', label: 'IN +91' },
];

const COLLEGE_DEPARTMENTS = [
  'College of Law',
  'College of Agriculture',
  'College of Liberal Arts',
  'College of Architecture',
  'College of Nursing',
  'College of Asian & Islamic Studies',
  'College of Computing Studies',
  'College of Forestry & Environmental Studies',
  'College of Criminal Justice Education',
  'College of Home Economics',
  'College of Engineering',
  'College of Medicine',
  'College of Public Administration & Development Studies',
  'College of Sports Science & Physical Education',
  'College of Science and Mathematics',
  'College of Social Work & Community Development',
  'College of Teacher Education',
];

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function registerUser({
  email,
  password,
  first_name,
  last_name,
  college,
}) {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      first_name,
      last_name,
      college,
    }),
  });

  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error('The server returned an invalid response.');
  }

  if (!response.ok) {
    throw new Error(result.error || 'Registration failed.');
  }

  return result.data;
}

// Saves the phone number on the new profile (best effort: a failure here
// should not stop the registration).
async function savePhone(profileId, requesterId, phone) {
  try {
    await fetch(`${API_URL}/api/alumni/${profileId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requester_id: requesterId, phone }),
    });
  } catch {
    // ignore
  }
}

function App() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [countryCode, setCountryCode] = useState('+63');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    middleInitial: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    collegeDepartment: '',
    password: '',
    confirmPassword: '',
  });

  const isPH = countryCode === '+63';

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const created = await registerUser({
        email: formData.email.trim(),
        password: formData.password,
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        college: formData.collegeDepartment,
      });

      await savePhone(created.profile_id, created.id, `${countryCode}${formData.phone}`);

      // The next step (certificate upload) needs to know who just registered.
      // sessionStorage is used on purpose so this is NOT treated as a login.
      try {
        sessionStorage.setItem(
          'wmsu_register',
          JSON.stringify({ id: created.id, profile_id: created.profile_id, email: created.email })
        );
      } catch {
        // storage unavailable; the next page will ask the user to start over
      }

      navigate('/phase2register');
    } catch (err) {
      alert(err.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="App">
      {/* Navbar here */}

      <div className="register">
        <h2>Register</h2>
        <p>Please fill in the form below to create an account.</p>

        <form onSubmit={handleSubmit}>
          <div className="name-row">
            <label>
              First name
              <input
                type="text"
                id="firstName"
                name="firstName"
                placeholder="First"
                autoComplete="given-name"
                minLength={2}
                maxLength={50}
                pattern="[A-Za-zÀ-ÿ' \-]+"
                title="Letters, spaces, apostrophes and hyphens only"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </label>

            <label className="initial">
              M.I.
              <input
                type="text"
                id="middleInitial"
                name="middleInitial"
                placeholder="M"
                autoComplete="additional-name"
                maxLength={2}
                pattern="[A-Za-z]\.?"
                title="One letter, with an optional period (e.g. M or M.)"
                value={formData.middleInitial}
                onChange={handleChange}
              />
            </label>

            <label>
              Last name
              <input
                type="text"
                id="lastName"
                name="lastName"
                placeholder="Last"
                autoComplete="family-name"
                minLength={2}
                maxLength={50}
                pattern="[A-Za-zÀ-ÿ' \-]+"
                title="Letters, spaces, apostrophes and hyphens only"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          <div className="account-row">
            <label>
              Username
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Username"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                minLength={3}
                maxLength={20}
                pattern="[A-Za-z0-9_]+"
                title="3-20 characters: letters, numbers and underscores only"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Email
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Email"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                maxLength={254}
                value={formData.email}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          <div className="contact-row">
            <label>
              Phone number

              <div className="phone-row">
                <select
                  name="countryCode"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  aria-label="Country code"
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>

                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder={isPH ? '9171234567' : 'Phone Number'}
                  autoComplete="tel-national"
                  inputMode="numeric"
                  pattern={isPH ? '^9[0-9]{9}$' : '^[0-9]{6,12}$'}
                  title={isPH
                    ? 'Enter 10 digits starting with 9, without the leading 0 (e.g. 9171234567)'
                    : 'Enter 6-12 digits without the country code'}
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </label>

            <label>
              College Department
              <select
                name="collegeDepartment"
                value={formData.collegeDepartment}
                onChange={handleChange}
                required
              >
                <option value="">Select your college</option>
                {COLLEGE_DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="password-row">
            <label>
              Password

              <div className="input-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  placeholder="Password"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={128}
                  pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}"
                  title="At least 8 characters with an uppercase letter, a lowercase letter and a number"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />

                <button
                  type="button"
                  className="toggle-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </label>

            <label>
              Confirm password

              <div className="input-wrap">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={128}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />

                <button
                  type="button"
                  className="toggle-btn"
                  onClick={() => setShowConfirm((prev) => !prev)}
                  aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirm ? 'Hide' : 'Show'}
                </button>
              </div>
            </label>
          </div>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Registering...' : 'Proceed'}
          </button>
        </form>
      </div>

      {/* Footer here */}
    </div>
  );
}

export default App;