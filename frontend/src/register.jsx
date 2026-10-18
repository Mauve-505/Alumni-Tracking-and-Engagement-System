import { useState } from 'react'
import './register.css'

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
]

function App() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [countryCode, setCountryCode] = useState('+63')

  const isPH = countryCode === '+63'

  return (
    <div className="App">

        {/* navbar here */}

      <div className="register">
        <h2>Register</h2>
        <p>Please fill in the form below to create an account.</p>
        <form>
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
                required
              />
            </label>
          </div>

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
                placeholder={isPH ? '987 6543 210' : 'Phone Number'}
                autoComplete="tel-national"
                inputMode="numeric"
                pattern={isPH ? '9\\d{9}' : '\\d{6,12}'}
                title={
                  isPH
                    ? '10 digits starting with 9, without the leading 0 (e.g. 9171234567)'
                    : '6-12 digits, without the country code'
                }
                required
              />
            </div>
          </label>

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
                  pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}"
                  title="At least 8 characters with an uppercase letter, a lowercase letter and a number"
                  required
                />
                <button
                  type="button"
                  className="toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
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
                  required
                />
                <button
                  type="button"
                  className="toggle-btn"
                  onClick={() => setShowConfirm(!showConfirm)}
                  aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirm ? 'Hide' : 'Show'}
                </button>
              </div>
            </label>
          </div>

          <button type="submit">Register</button>
        </form>
      </div>

        {/* footer here */}

    </div>
  )
}

export default App