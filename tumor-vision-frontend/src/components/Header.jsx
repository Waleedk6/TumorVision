import React from "react";
import { Link } from "react-router-dom";
import '.././App.css'; // ✅ Import global styles
import { Button } from "react-bootstrap";

const Header = () => {
  return (
    <header className="app-header">
      <div className="header-container">
        <Link to="/" className="logo">
          <span className="logo-icon">🧠</span>
          <span className="logo-text">TumorVision</span>
        </Link>
        <nav className="nav-links">
          <Button
            as={Link}
            to="/login"
            variant="outline-light"
            className="nav-link px-3 py-1 custom-outline-hover"
            size="sm"
          >
            Medical Login
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
