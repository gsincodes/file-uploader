import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './styles/uploadfile.css';

function UploadFile() {
    const { folderId } = useParams();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setSelectedFile(file);
        setError(null);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = () => {
        setDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            setSelectedFile(file);
            setError(null);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedFile) {
            setError('Please select a file');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            // Compute URL based on folderId
            const url = folderId 
                ? `/api/folders/${folderId}/upload` 
                : '/api/folders/upload';

            const response = await fetch(url, {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            const result = await response.json();

            if (response.ok && result.success) {
                folderId ? navigate(`/my-folders/${folderId}`) : navigate('/my-folders');
            } else {
                setError(result.message || 'File upload failed');
            }
        }
        catch (error) {
            console.error('Upload error:', error);
            setError('Network error. Please try again.');
        }
        finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="upload-file-container">
            <div className="loading-state">
                <div className="loading-spinner"></div>
                <p className="loading-text">Uploading File...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="upload-file-container">
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
        <div className="upload-file-container">
            <div className="upload-card">
                <div className="upload-header">
                    <span className="upload-icon">📤</span>
                    <h1 className="upload-title">Upload a File</h1>
                    <p className="upload-subtitle">
                        {folderId ? "Upload to this folder" : "Upload to root"}
                    </p>
                </div>
                
                <div 
                    className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('fileInput').click()}
                >
                    <span className="upload-icon-large">📁</span>
                    <h3 className="upload-text">
                        {dragOver ? 'Drop file here' : 'Drag & drop or click to browse'}
                    </h3>
                    <p className="upload-hint">
                        Supports images, documents, PDFs, and more
                    </p>
                    <button 
                        type="button" 
                        className="browse-button"
                        onClick={(e) => {
                            e.stopPropagation();
                            document.getElementById('fileInput').click();
                        }}
                    >
                        Browse Files
                    </button>
                    <input 
                        type="file" 
                        id="fileInput"
                        className="file-input"
                        onChange={handleFileChange}
                    />
                </div>

                {selectedFile && (
                    <div className="selected-file-info">
                        <h4 className="file-info-title">Selected File</h4>
                        <div className="file-details">
                            <span className="file-icon">📄</span>
                            <div className="file-detail-content">
                                <h5 className="file-name">{selectedFile.name}</h5>
                                <p className="file-size">
                                    {formatFileSize(selectedFile.size)} • {selectedFile.type || 'Unknown type'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <button 
                        type="submit" 
                        disabled={!selectedFile || loading}
                        className="submit-button"
                    >
                        {loading ? 'Uploading...' : 'Upload File'}
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
    )
}

export default UploadFile;