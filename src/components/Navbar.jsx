import { useState } from 'react';
import './Navbar.css';

const NAV_LINKS = ['Home', 'Trending', 'Movies', 'Series', 'My List', 'Search'];

export default function Navbar({ onNavigateHome, currentPage }) {
  const [activeLink, setActiveLink] = useState('Home');

  function handleLinkClick(link) {
    setActiveLink(link);
    if (link === 'Home') {
      onNavigateHome();
    }
  }

  return (
    <nav className="navbar">
      <div className="navbar__inner">
        {/* Logo */}
        <button className="navbar__logo" onClick={onNavigateHome} aria-label="Go to home">
          <span className="navbar__logo-icon">⬡</span>
          <span className="navbar__logo-text gradient-text">AniVision</span>
        </button>

        {/* Nav Links */}
        <ul className="navbar__links">
          {NAV_LINKS.map(link => (
            <li key={link}>
              <button
                className={`navbar__link ${activeLink === link && currentPage === 'home' ? 'navbar__link--active' : ''}`}
                onClick={() => handleLinkClick(link)}
              >
                {link}
              </button>
            </li>
          ))}
        </ul>

        {/* Right Icons */}
        <div className="navbar__icons">
          <button className="navbar__icon-btn" aria-label="Search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
          <button className="navbar__icon-btn" aria-label="Notifications">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </button>
          <button className="navbar__profile" aria-label="Profile">
            <span>A</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
