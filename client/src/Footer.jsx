import './styles/footer2.css';

function Footer() {
    return (
        <div id='footer'>
            <div className="footer-content">
                <div className="footer-copyright">
                    © {new Date().getFullYear()} FileManager by gsincodes.
                </div>
                <div id='footer-contact'>
                    Contact: gsincodes@gmail.com
                </div>
            </div>
        </div>
    )
}

export default Footer;