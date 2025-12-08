import Header from "./Header";
import Footer from "./Footer";
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './styles/home2.css';

function Home() {
    const [user, setUser] = useState('');
    const [dataFetched, setDataFetched] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/home', {
                    credentials: 'include'
                });

                if (response.status === 401) {
                    navigate('/log-in');
                    return;
                }

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();

                if(result.success) {
                    setUser(result.loggedUser?.name || 'User');
                    setDataFetched(result.myFiles || []);
                }
                else {
                    setError(result.message || 'Failed to load data');
                }
            }
            catch(error) {
                console.error('Fetch error:', error);
                setError('Failed to fetch data. Please try again.');
            }
            finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    if (loading) return (
        <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading...</p>
        </div>
    );

    if(error) return (
        <div className="error-container">
            <div className="error-message">
                Error: {error}
            </div>
            <button 
                onClick={() => window.location.reload()}
                className="retry-button"
            >
                Try Again
            </button>
        </div>
    );

    return (
        <div className="home-page">
            <Header />
            <div className="home-content">
                {/* Welcome Section */}
                <div className="welcome-section">
                    <h1 className="welcome-title">
                        Hello <span className="user-name">{user}</span>
                    </h1>
                    <p className="welcome-subtitle">
                        Welcome to your file manager
                    </p>
                </div>

                {/* Files Section */}
                <div className="files-section">
                    <div className="files-header">
                        <h1 className="files-title">My Files</h1>
                    </div>
                    
                    {dataFetched.length === 0 ? (
                        <div className="empty-state">
                            <p className="empty-message">No files found</p>
                            <Link to='/my-folders/upload'>
                                <button className="upload-button">
                                    Upload Your First File
                                </button>
                            </Link>
                        </div>
                    ) : (
                        <div className="files-grid">
                            {dataFetched.map(file => {
                                const isImage = file.mimeType?.startsWith('image/');
                                return (
                                    <div key={file.id} className="file-card">
                                        <div className="file-header">
                                            <h3 className="file-name" title={file.originalName}>
                                                {file.originalName}
                                            </h3>
                                        </div>
                                        
                                        {isImage ? (
                                            <div className="image-preview">
                                                <img 
                                                    src={`/uploads/${file.name}`} 
                                                    alt={file.originalName}
                                                    className="preview-image"
                                                />
                                            </div>
                                        ) : (
                                            <div className="document-preview">
                                                📄 Document File
                                            </div>
                                        )}
                                        
                                        <div className="file-footer">
                                            <span className="file-size">
                                                {file.size ? `${(file.size / 1024).toFixed(1)} KB` : 'Size unknown'}
                                            </span>
                                            <a 
                                                href={`/uploads/${file.name}`} 
                                                download
                                                className="download-link"
                                            >
                                                Download
                                            </a>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="quick-actions">
                    <Link to='/my-folders' className="action-card">
                        <h3 className="action-title">📁 Browse Folders</h3>
                        <p className="action-description">Organize your files in folders</p>
                    </Link>
                    
                    <Link to='/my-folders/upload' className="action-card">
                        <h3 className="action-title">📤 Upload Files</h3>
                        <p className="action-description">Add new files to your storage</p>
                    </Link>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default Home;