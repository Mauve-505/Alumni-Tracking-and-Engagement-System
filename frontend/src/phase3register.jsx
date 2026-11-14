// import { useState } from 'react'
import './phase3register.css'
import { useNavigate } from 'react-router-dom';

function App() {
    const navigate = useNavigate();

    return (
        <div className="App">
            <div className="authentication">
                <h2>Authentication</h2>
                <p>please wait while we verify your information</p>
                <a>Return to <button type="button" onClick={() => navigate('/login')}>
                Login
              </button> page</a>
            </div>
        </div>
    )   
}
export default App;