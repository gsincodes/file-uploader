import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function LogOut() {

    const navigate = useNavigate();

    useEffect(() => {
        const handleLogout = async () => {
            try {
                const response = await fetch('/api/log-out', {
                    method: 'POST', 
                    credentials: 'include'
                });

                const data = await response.json();

                if (!data.isAuthenticated) {
                    // Already logged out, just redirect
                    localStorage.removeItem('userToken');
                    sessionStorage.clear();
                    navigate('/log-in');
                    return;
                }
            }
            catch (error) {
                console.error('Logout error:', error);
                localStorage.clear();
                navigate('/log-in');
            }
        }
        handleLogout();
    }, []);

    return (
        <div>
            <h1>Logging Out...</h1>
            <p>Please Wait while we securely log you out!</p>
        </div>
    )
}

export default LogOut;