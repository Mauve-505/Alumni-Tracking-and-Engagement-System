
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './log-in.css';
import building from './assets/wmsu-building.png';

const ROLE_KEY = 'wmsu_role';

const saveRole = (role) => {
  try {
    localStorage.setItem(ROLE_KEY, role);
  } catch {
    // Storage unavailable; ignore.
  }
};

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function loginRequest({ email, password }) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: email.trim(),
      password,
    }),
  });

  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error('The server returned an invalid response.');
  }

  if (!response.ok) {
    throw new Error(result.error || 'Login failed.');
  }

  return result.data;
}

const EMPTY_CREDENTIALS = {
  email: '',
  password: '',
};

function App() {
  const [credentials, setCredentials] = useState(EMPTY_CREDENTIALS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const updateField = (field) => (e) => {
    setCredentials((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const user = await loginRequest(credentials);

      saveRole(user.role);

      try {
        localStorage.setItem('wmsu_user', JSON.stringify(user));
      } catch {
        // Storage unavailable; ignore.
      }

      navigate(user.role === 'admin' ? '/admin' : '/home');
    } catch (err) {
      alert(err.message || 'Unable to log in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="log-in_page">
      <div className="body">
        <div className="banner">
          <img src={building} alt="WMSU Building" />
        </div>

        <form onSubmit={handleSubmit}>
          <p>Enter Log-in credentials</p>

          <p>Email address:</p>
          <input
            type="email"
            name="email"
            placeholder="Enter your registered email"
            autoComplete="email"
            value={credentials.email}
            onChange={updateField('email')}
            required
          />

          <p>Password:</p>
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            value={credentials.password}
            onChange={updateField('password')}
            required
          />

          <button
            type="submit"
            className="login_button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>

          <p>Don't have an account yet?</p>

          <button
            type="button"
            className="signup_button"
            onClick={() => navigate('/register')}
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
