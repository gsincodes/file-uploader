import './styles/footer.css';

function Footer() {
    return (
        <div id='footer'>
            <div className="footer-content">
                <div className="footer-links">
                    <a href="/" className="footer-link">Home</a>
                    <a href="https://github.com/gsincodes" className="footer-link">Github</a>
                </div>
                {/* <div className="footer-social">
                    <span className="social-icon">📘</span>
                    <span className="social-icon">🐦</span>
                    <span className="social-icon">📷</span>
                    <span className="social-icon">💼</span>
                </div> */}
                <div className="footer-copyright">
                    © {new Date().getFullYear()} FileManager by gsincodes.
                </div>
            </div>
        </div>
    )
}

export default Footer;