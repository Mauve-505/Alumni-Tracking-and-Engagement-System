import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './log-in.css';
import building from './assets/wmsu-building.png';

const ROLE_KEY = 'wmsu_role';

// Saves the role ('admin' or 'user') in the browser after login
const saveRole = (role) => {
  try {
    localStorage.setItem(ROLE_KEY, role);
  } catch {
    /* storage unavailable, ignore */
  }
};

async function loginRequest({ id }) {
  return { role: id.toLowerCase().startsWith('admin') ? 'admin' : 'user' };
}

const EMPTY_CREDENTIALS = { id: '', password: '' };

function App() {
  const [credentials, setCredentials] = useState(EMPTY_CREDENTIALS);
  const navigate = useNavigate();

  const updateField = (field) => (e) =>
    setCredentials((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { role } = await loginRequest(credentials);
      saveRole(role);
      console.log(`Logged in as ${role}:`, credentials.id);
      // navigate(role === 'admin' ? '/admin' : '/home');
    } catch (err) {
      console.error('Login failed:', err);
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

          <p>Username/ID number:</p>
          <input
            type="text"
            placeholder="Enter your username or ID number"
            value={credentials.id}
            onChange={updateField('id')}
            required
          />

          <p>Password:</p>
          <input
            type="password"
            placeholder="Enter your password"
            value={credentials.password}
            onChange={updateField('password')}
            minLength={6}
            required
          />

          <button type="submit" className="login_button">
            Login
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