import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from "./Header";
import Footer from "./Footer";
import './styles/myfolder.css';

function MyFolders() {
    const [dataFetched, setDataFetched] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { folderId } = useParams();
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                let response;

                if(folderId) {
                    response = await fetch(`/api/folders/${folderId}`);
                }
                else {
                    response = await fetch(`/api/folders`);
                }

                if(!response.ok) {
                    throw new Error(`HTTP response code ${response.status}`);
                }

                const result = await response.json();

                console.log("API response -> ", result);
                console.log('value of sub Folders ->', result.myFolders);
                console.log('saved File exists: ', !!result.savedFile);
                console.log('saved File value -> ', result.savedFile);

                if(result.success) {
                    setDataFetched(result);
                } else {
                    if(response.status === 401) {
                        window.location.href = '/log-in';
                    } else {
                        setError(result.message);
                    }
                }
            }
            catch(error) {
                console.error(error);
                setError('Failed to Fetch Data');
            }
            finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [folderId]);

    if(loading) return <div className="loading-state">Loading...</div>
    if(error) return (
        <div className="error-state">
            <div className="error-message">Error: {error}</div>
        </div>
    )

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
                        <span className="breadcrumb-item">Current Folder</span>
                    </div>
                )}

                {/* Content Grid */}
                {!dataFetched || (!dataFetched.myFolders || dataFetched.myFolders.length === 0) && (!dataFetched.savedFile || dataFetched.savedFile.length === 0) ? ( 
                    <div className="empty-state">
                        <h2 className="empty-title">No Files Yet</h2>
                        <p className="empty-message">
                            {folderId ? "This folder is empty." : "You haven't uploaded any files yet."}
                        </p>
                    </div>
                ) : (
                    <div className="content-grid">
                        {/* Folders */}
                        {dataFetched.myFolders && dataFetched.myFolders.length > 0 && 
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
                        {dataFetched.savedFile && dataFetched.savedFile.length > 0 && 
                            dataFetched.savedFile.map((file) => (
                                <div key={file.id || file.name} className="file-card">
                                    <div className="file-icon">
                                        {file.mimeType?.startsWith('image/') ? '🖼️' : '📄'}
                                    </div>
                                    <h3 className="file-name">{file.originalName}</h3>
                                    
                                    {file.mimeType?.startsWith('image/') ? (
                                        <div className="file-preview">
                                            <img 
                                                src={`/uploads/${file.name}`} 
                                                alt={file.name} 
                                                className="preview-image"
                                            />
                                        </div>
                                    ) : null}
                                    
                                    <div className="file-actions">
                                        <a 
                                            href={`/uploads/${file.name}`} 
                                            download
                                            className="download-button"
                                        >
                                            Download File
                                        </a>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                )}

                {/* Action Buttons */}
                <div className="action-buttons">
                    {folderId ? (
                        <>
                            <Link to={`/my-folders/${folderId}/create`} className="action-button create">
                                Create Folder
                            </Link>
                            <Link to={`/my-folders/${folderId}/upload`} className="action-button upload">
                                Upload Files
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link to="/my-folders/create" className="action-button create">
                                Create Folder
                            </Link>
                            <Link to="/my-folders/upload" className="action-button upload">
                                Upload Files
                            </Link>
                        </>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default MyFolders;