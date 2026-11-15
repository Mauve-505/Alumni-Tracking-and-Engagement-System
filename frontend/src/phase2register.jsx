import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './phase2register.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const MAX_BYTES = 5 * 1024 * 1024;

function getRegistered() {
    try {
        return JSON.parse(sessionStorage.getItem('wmsu_register'));
    } catch {
        return null;
    }
}

function App() {
    const navigate = useNavigate();
    const [registered] = useState(getRegistered);
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Free the preview URL when it changes or the page closes
    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    const handleFileChange = (e) => {
        const chosen = e.target.files[0];
        setError('');
        setFile(null);
        setPreview(null);
        if (!chosen) return;

        if (chosen.size > MAX_BYTES) {
            setError('That file is too large. The maximum is 5 MB.');
            e.target.value = '';
            return;
        }
        setFile(chosen);
        // Only images can be previewed; a PDF just shows its file name
        if (chosen.type.startsWith('image/')) {
            setPreview(URL.createObjectURL(chosen));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        if (!file) {
            setError('Please choose your graduation certificate first.');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const response = await fetch(
                `${API_URL}/api/alumni/${registered.profile_id}/certificate?requester_id=${registered.id}`,
                { method: 'POST', body: file }
            );
            let result = {};
            try {
                result = await response.json();
            } catch {
                // keep the generic message below
            }
            if (!response.ok) {
                throw new Error(result.error || 'Upload failed. Please try again.');
            }
            navigate('/phase3register');
        } catch (err) {
            setError(err.message || 'Upload failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!registered) {
        return (
            <div className="App">
                <div className="grad_certificate">
                    <h2>Graduation Certificate</h2>
                    <p>We could not find your registration. Please sign up first.</p>
                    <button type="button" onClick={() => navigate('/register')}>
                        Go to Register
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="App">
            <form onSubmit={handleSubmit} className={`grad_certificate ${preview ? 'has-preview' : ''}`}>
                <h2>Graduation Certificate</h2>
                <p>Please upload your graduation certificate (image or PDF, max 5 MB) so an administrator can verify you.</p>

                <input type="file" accept="image/png,image/jpeg,image/webp,application/pdf" onChange={handleFileChange} />

                {file && !preview && <p>Selected file: {file.name}</p>}

                {preview && (
                    <div className="preview-wrap">
                        <img src={preview} alt="Certificate preview" className="preview-img" />
                    </div>
                )}

                {error && <p role="alert" style={{ color: '#b00020' }}>{error}</p>}

                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Uploading...' : 'Proceed'}
                </button>
            </form>
        </div>
    );
}

export default App;