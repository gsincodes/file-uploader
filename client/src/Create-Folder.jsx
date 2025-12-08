import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import './styles/createfolder2.css';
import Header from './Header';
import Footer from './Footer';

function CreateFolder() {
    const { folderId } = useParams();

    const [formData, setFormData] = useState({
        folderName: ''
    })
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name] : e.target.value
        })
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        try {
            let response;
            if(folderId) {
                response = await fetch(`/api/folders/${folderId}/create`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        folderName: formData.folderName
                    }),
                    credentials: 'include'
                });
            } else {
                response = await fetch('/api/folders/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        folderName: formData.folderName
                    }),
                    credentials: 'include'
                });
            }

            const result = await response.json();

            if(response.ok && result.success) {
                console.log('Folder created successfully', result);
                folderId ? navigate(`/my-folders/${folderId}`) : navigate('/my-folders');
            } else {
                setError(result.message || 'folder creation failed');
            }
        }
        catch(error) {
            console.error(error);
            setError('Network Error. Please try again');
        }
        finally {
            setLoading(false);
        }
    };

    if(loading) return (
        <div className="create-folder-container">
            <div className="loading-state">
                <div className="loading-spinner"></div>
                <p className="loading-text">Creating Folder...</p>
            </div>
        </div>
    );

    if(error) return (
        <div className="create-folder-container">
            <div className="error-state">
                <div className="error-icon">❌</div>
                <div className="error-message">Error: {error}</div>
                <button 
                    onClick={() => setError(null)} 
                    className="retry-button"
                >
                    Try Again
                </button>
            </div>
        </div>
    );

    return (
        <>
            <Header />
            <div className="create-folder-container">
                <div className="create-folder-card">
                    <div className="create-folder-header">
                        <span className="create-folder-icon">📁</span>
                        <h1 className="create-folder-title">Create a Folder</h1>
                        <p className="create-folder-subtitle">
                            {folderId ? "Create a new subfolder" : "Create a new folder in root"}
                        </p>
                    </div>
                    
                    <form className="create-folder-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="folderName" className="form-label">Folder Name</label>
                            <input 
                                type="text" 
                                id="folderName" 
                                name="folderName" 
                                value={formData.folderName} 
                                onChange={handleChange} 
                                disabled={loading}
                                className="form-input"
                                placeholder="Enter folder name"
                                required
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="submit-button"
                        >
                            {loading ? 'Creating Folder...' : 'Create Folder'}
                        </button>
                    </form>

                    <Link 
                        to={folderId ? `/my-folders/${folderId}` : '/my-folders'} 
                        className="back-link"
                    >
                        ← Back to Folders
                    </Link>
                </div>
            </div>
            <Footer />
        </>
    )
}

export default CreateFolder;