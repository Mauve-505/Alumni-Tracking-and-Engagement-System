import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './phase2register.css';

function App() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [preview, setPreview] = useState(null);
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPreview(URL.createObjectURL(file));
        } else {
            setPreview(null);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        setTimeout(() => {
            navigate('/phase3register');
        }, 500);
    };

    return (
        <div className="App">
            <form onSubmit={handleSubmit} className={`grad_certificate ${preview ? 'has-preview' : ''}`}>
                <h2>Graduation Certificate</h2>
                <p>Please insert your graduation certificate to proceed with authentication</p>

                <input type="file" accept="image/*" onChange={handleFileChange} />

                {preview && (
                    <div className="preview-wrap">
                        <img src={preview} alt="Certificate preview" className="preview-img" />
                    </div>
                )}

                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Registering...' : 'Proceed'}
                </button>
            </form>
        </div>
    );
}

export default App;