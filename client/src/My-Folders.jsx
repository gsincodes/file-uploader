import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from "./Header";
import Footer from "./Footer";
import './styles/myfolder.css';

function MyFolders() {
    const [dataFetched, setDataFetched] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { folderId } = useParams();
    const navigate = useNavigate();
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const url = folderId ? `/api/folders/${folderId}` : `/api/folders`;
                
                const response = await fetch(url, {
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

                if (result.success) {
                    setDataFetched(result);
                } else {
                    setError(result.message || 'Failed to fetch data');
                }
            }
            catch (error) {
                console.error('Fetch error:', error);
                setError('Failed to fetch data');
            }
            finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [folderId, navigate]);

    if (loading) return (
        <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading...</p>
        </div>
    );

    if (error) return (
        <div className="error-container">
            <div className="error-message">Error: {error}</div>
            <button 
                onClick={() => window.location.reload()}
                className="retry-button"
            >
                Try Again
            </button>
        </div>
    );

    const hasFolders = dataFetched?.myFolders && dataFetched.myFolders.length > 0;
    const hasFiles = dataFetched?.savedFile && dataFetched.savedFile.length > 0;
    const isEmpty = !hasFolders && !hasFiles;

    return (
        <div className="myfolders-container">
            <Header />
            <div className="myfolders-content">
                <div className="page-header">
                    <h1 className="page-title">My Folders</h1>
                </div>

                {/* Current Folder Info */}
                {dataFetched?.currentFolder && (
                    <div className="current-folder">
                        <h3 className="current-folder-title">
                            📁 {dataFetched.currentFolder.name}
                        </h3>
                        <p className="folder-path">
                            {dataFetched.currentFolder.path || "Current Folder"}
                        </p>
                    </div>
                )}

                {/* Breadcrumb Navigation */}
                {folderId && (
                    <div className="breadcrumb">
                        <Link to="/my-folders" className="breadcrumb-item">Home</Link>
                        <span className="breadcrumb-separator">/</span>
                        <span className="breadcrumb-item">{dataFetched?.currentFolder?.name}</span>
                    </div>
                )}

                {/* Empty State */}
                {isEmpty ? (
                    <div className="empty-state">
                        <h2 className="empty-title">No Content Yet</h2>
                        <p className="empty-message">
                            {folderId ? "This folder is empty." : "You haven't created any folders or uploaded files yet."}
                        </p>
                    </div>
                ) : (
                    <div className="content-grid">
                        {/* Folders */}
                        {hasFolders && 
                            dataFetched.myFolders.map((folder) => (
                                <div key={folder.id} className="folder-card">
                                    <Link to={`/my-folders/${folder.id}`} className="folder-link">
                                        <div className="folder-icon">📁</div>
                                        <h3 className="folder-name">{folder.name}</h3>
                                    </Link>
                                </div>
                            ))
                        }

                        {/* Files */}
                        {hasFiles && 
                            dataFetched.savedFile.map((file) => (
                                <div key={file.id} className="file-card">
                                    <div className="file-icon">
                                        {file.mimeType?.startsWith('image/') ? '🖼️' : '📄'}
                                    </div>
                                    <h3 className="file-name">{file.originalName}</h3>
                                    
                                    {file.mimeType?.startsWith('image/') && (
                                        <div className="file-preview">
                                            <img 
                                                src={`/uploads/${file.name}`} 
                                                alt={file.originalName} 
                                                className="preview-image"
                                            />
                                        </div>
                                    )}
                                    
                                    <div className="file-actions">
                                        <a 
                                            href={`/uploads/${file.name}`} 
                                            download
                                            className="download-button"
                                        >
                                            Download
                                        </a>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                )}

                {/* Action Buttons */}
                <div className="action-buttons">
                    <Link 
                        to={folderId ? `/my-folders/${folderId}/create` : "/my-folders/create"} 
                        className="action-button create"
                    >
                        📁 Create Folder
                    </Link>
                    <Link 
                        to={folderId ? `/my-folders/${folderId}/upload` : "/my-folders/upload"} 
                        className="action-button upload"
                    >
                        📤 Upload Files
                    </Link>
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default MyFolders;