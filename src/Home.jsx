import Header from "./Header";
import Footer from "./Footer";
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './styles/home.css'; // Import the CSS file

function HomeContent() {
    const [user, setUser] = useState('xyz');
    const [dataFetched, setDataFetched] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log("starting to fetch from /api/home...");
                const response = await fetch('/api/home', {
                    credentials: 'include'
                });

                console.log("Response Status", response.status);
                console.log("Response ok: ", response.ok);
                console.log('response->', response);

                if (response.status === 401) {
                    console.log('User not authenticated, redirecting to login...');
                    window.location.href = '/log-in';
                    return;
                }

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();

                console.log("API response -> ", result);
                console.log("typeof logged User -> ", typeof result.loggedUser);
                console.log('value of loggedUser ->', result.loggedUser);
                console.log('myfiles exists: ', !!result.myFiles);
                console.log('myfiles value -> ', result.myFiles);

                console.log("API response", result);

                if(result.success) {
                    setUser(result.loggedUser.name);
                    setDataFetched(result.myFiles);
                }
                else {
                    setError(result.message);
                }
            }
            catch(error) {
                console.error(error);
                if (error.message.includes('401')) {
                    window.location.href = '/log-in';
                } else {
                    setError('Failed to fetch data. Please try again.');
                }
            }
            finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return (
        <div className="loading-container">
            Loading...
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
        <div className="home-container">
            <Header />
            <div className="home-content-wrapper">
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
                        <h1 className="files-title">
                            MY FILES
                        </h1>
                        <Link to='/my-folders'>
                            <button className="folders-button">
                                📁 My Folders
                            </button>
                        </Link>
                    </div>
                    
                    {!dataFetched || dataFetched.length === 0 ? (
                        <div className="empty-state">
                            <p className="empty-message">No files found</p>
                            <Link to='/upload'>
                                <button className="upload-button">
                                    📤 Upload Your First File
                                </button>
                            </Link>
                        </div>
                    ) : (
                        <div className="files-grid">
                            {dataFetched.map(file => {
                                const isImage = file.mimeType?.startsWith('image/');
                                return (
                                    <div key={file.id || file.name} className="file-card">
                                        <div className="file-header">
                                            <div className={`file-icon ${isImage ? '' : 'document'}`}>
                                                {isImage ? '🖼️' : '📄'}
                                            </div>
                                            <h3 className="file-name" title={file.originalName}>
                                                {file.originalName}
                                            </h3>
                                        </div>
                                        
                                        {isImage ? (
                                            <div className="image-preview">
                                                <img 
                                                    src={`/uploads/${file.name}`} 
                                                    alt={file.name} 
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
                    
                    <Link to='/upload' className="action-card">
                        <h3 className="action-title">📤 Upload Files</h3>
                        <p className="action-description">Add new files to your storage</p>
                    </Link>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default HomeContent;