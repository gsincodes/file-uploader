import './styles/header.css';

function Header() {
    return (
        <div id='header'>
            <ul>
                <li className="nav-item">
                    <a href='/'>Home</a>
                </li>
                <li className="nav-item">
                    <a href='https://www.linkedin.com/in/gsincodes/'>LinkedIn</a>
                </li>
            </ul>
        </div>
    )
}

export default Header;