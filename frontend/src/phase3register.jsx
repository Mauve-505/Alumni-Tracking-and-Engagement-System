import { useEffect } from 'react';
import './phase3register.css';
import { useNavigate } from 'react-router-dom';

function App() {
    const navigate = useNavigate();

    // Registration is finished; forget the temporary sign-up info
    useEffect(() => {
        try {
            sessionStorage.removeItem('wmsu_register');
        } catch {
            // ignore
        }
    }, []);

    return (
        <div className="App">
            <div className="authentication">
                <h2>Pending Verification</h2>
                <p>
                    Thank you for registering! An administrator will review your graduation
                    certificate. You can log in once your account is verified.
                </p>
                <a>Return to <button type="button" onClick={() => navigate('/login')}>
                Login
              </button> page</a>
            </div>
        </div>
    );
}
export default App;