import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="app-header">
      <div className="header-container">
        <Link to="/" className="logo">
          <span className="logo-icon">🧠</span>
          <span className="logo-text">TumorVision</span>
        </Link>
        <nav className="nav-links">
          <Link to="/login" className="nav-link medical-login">
            Medical Login
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;