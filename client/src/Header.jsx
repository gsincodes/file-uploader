import './styles/header2.css';

function Header() {
    return (
        <div id='header'>
            <div id='logo'>
                <h1>FileUp</h1>
            </div>
            <ul id='nav-links'>
                <li className="nav-item">
                    <a href='/'>Home</a>
                </li>
                <li className="nav-item">
                    <a href='https://www.linkedin.com/in/gsincodes/'>LinkedIn</a>
                </li>
                <li className="nav-item">
                    <a href='https://github.com/gsincodes'>GitHub</a>
                </li>
                <li className='nav-item'>
                    <a href='/log-out'>Log Out</a>
                </li>
            </ul>
        </div>
    )
}

export default Header;