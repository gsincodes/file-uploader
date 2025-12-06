import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import './styles/logout.css';

function LogOut() {
    const navigate = useNavigate();

    useEffect(() => {
        const handleLogout = async () => {
            try {
                const response = await fetch('/api/log-out', {
                    method: 'POST', 
                    credentials: 'include'
                });

                if (response.ok) {
                    // Logout successful
                    navigate('/log-in');
                } else {
                    // Logout failed
                    console.error('Logout failed:', response.status);
                    navigate('/log-in');
                }
            }
            catch (error) {
                console.error('Logout error:', error);
                // Still redirect even if error occurs
                navigate('/log-in');
            }
        };

        handleLogout();
    }, [navigate]);

    return (
        <div className="logout-container">
            <div className="logout-content">
                <div className="logout-spinner"></div>
                <h1 className="logout-title">Logging Out...</h1>
                <p className="logout-subtitle">Please wait while we securely log you out</p>
            </div>
        </div>
    );
}

export default LogOut;