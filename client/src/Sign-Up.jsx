import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import './styles/signup.css';

function SignUp() {
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.firstname.trim() || !formData.lastname.trim() || 
            !formData.email.trim() || !formData.password.trim()) {
            setError('All fields are required');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/sign-up", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok && data.success) {
                navigate('/log-in');
            } else {
                setError(data.message || 'Sign-up failed');
            }
        } catch (error) {
            console.error('Sign-up error:', error);
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div id="sign-up-content">
            <div className="loading-state">
                <div className="loading-spinner"></div>
                <p className="loading-text">Creating Account...</p>
            </div>
        </div>
    );

    return (
        <div id="sign-up-content">
            <div className="signup-card">
                <div className="signup-header">
                    <span className="signup-icon">👤</span>
                    <h1 className="signup-title">Sign Up</h1>
                    <p className="signup-subtitle">Create your account to get started</p>
                </div>
                
                {error && (
                    <div className="signup-error">
                        {error}
                    </div>
                )}
                
                <form className="signup-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="firstname" className="form-label">First Name</label>
                        <input 
                            type="text" 
                            name="firstname" 
                            id="firstname" 
                            value={formData.firstname} 
                            onChange={handleChange} 
                            required 
                            disabled={loading}
                            className="form-input"
                            placeholder="Enter your first name"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="lastname" className="form-label">Last Name</label>
                        <input 
                            type="text" 
                            name="lastname" 
                            id="lastname" 
                            value={formData.lastname} 
                            onChange={handleChange} 
                            required 
                            disabled={loading}
                            className="form-input"
                            placeholder="Enter your last name"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input 
                            id="email" 
                            name="email" 
                            type="email" 
                            value={formData.email} 
                            onChange={handleChange} 
                            required 
                            disabled={loading}
                            className="form-input"
                            placeholder="Enter your email"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">Password</label>
                        <input 
                            id="password" 
                            name="password" 
                            type="password" 
                            value={formData.password} 
                            onChange={handleChange} 
                            required 
                            disabled={loading}
                            className="form-input"
                            placeholder="Create a password (min 6 characters)"
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="submit-button"
                    >
                        {loading ? 'Signing Up...' : 'Sign Up'}
                    </button>
                </form>
                
                <div className="login-link-container">
                    <p className="login-text">Already have an account?</p>
                    <Link to="/log-in" className="login-button">
                        Log In
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default SignUp;