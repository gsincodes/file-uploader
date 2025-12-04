import { Link, useNavigate } from "react-router-dom";
import { useState } from 'react';
import './styles/login.css';

function LogIn() {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleRememberMe = (e) => {
        setRememberMe(e.target.checked);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await fetch("/api/log-in", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({...formData, rememberMe}),
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok && data.success) {
                console.log('Login successful!', data);
                navigate('/');
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (error) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="login-container">
            <div className="login-loading-state">
                <div className="login-loading-spinner"></div>
                <p className="login-loading-text">Logging in...</p>
            </div>
        </div>
    );

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <span className="login-icon">🔐</span>
                    <h1 className="login-title">Please Log In</h1>
                    <p className="login-subtitle">Enter your credentials to continue</p>
                </div>
                
                {error && (
                    <div className="login-error">
                        {error}
                    </div>
                )}
                
                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="login-form-group">
                        <label htmlFor="email" className="login-form-label">Email</label>
                        <input 
                            id="email" 
                            name="email" 
                            type="email" 
                            value={formData.email} 
                            onChange={handleChange} 
                            disabled={loading} 
                            required
                            className="login-input"
                            placeholder="Enter your email"
                        />
                    </div>

                    <div className="login-form-group">
                        <label htmlFor="password" className="login-form-label">Password</label>
                        <input 
                            id="password" 
                            name="password" 
                            type="password" 
                            value={formData.password} 
                            onChange={handleChange} 
                            required 
                            disabled={loading}
                            className="login-input"
                            placeholder="Enter your password"
                        />
                    </div>

                    <div className="remember-me">
                        <input 
                            type="checkbox" 
                            id="rememberMe"
                            checked={rememberMe}
                            onChange={handleRememberMe}
                            className="remember-checkbox"
                        />
                        <label htmlFor="rememberMe" className="remember-label">
                            Remember me
                        </label>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="login-submit-button"
                    >
                        {loading ? 'Logging in...' : 'Log In'}
                    </button>
                </form>
                
                <div className="signup-link-container">
                    <p className="signup-text">Don't have an account?</p>
                    <Link to="/sign-up" className="signup-button">
                        Sign Up
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default LogIn;