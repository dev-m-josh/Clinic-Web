import React from 'react';
import { NavLink } from 'react-router-dom';
import '../Styles/Header.css';
import { useNavigate } from "react-router-dom";

function Header() {
    const navigate = useNavigate();
  return (
    <header className="clinic-header">
      <div className="clinic-logo">🏥 MyClinic</div>
      <nav className="clinic-nav">
        <NavLink to="/appointments">Appointments</NavLink>
        <NavLink to="/">Dashboard</NavLink>
        <NavLink to="/account">Account</NavLink>
        <button onClick={() => navigate('/register')} className="login-btn">SignUp</button>
      </nav>
    </header>
  );
}

export default Header;
