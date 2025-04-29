import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import '../Styles/Header.css';
import { useNavigate } from "react-router-dom";
import axios from 'axios';

function Header() {
    const navigate = useNavigate();
    const token = localStorage.getItem("myToken");
    const user = JSON.parse(localStorage.getItem("myUser"));
    const [isAdmin, setIsAdmin] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (user && user.UserRole === "Admin") {
            setIsAdmin(true);
        }
    }, [user, token]);

    // Handle logout
    const handleLogout = async (e) => {
        localStorage.removeItem("myToken");
        localStorage.removeItem("myUser");
        setIsAdmin(false);

        try {
            const response = await axios.put(
                `http://localhost:4500/users/deactivate-user/${user.UserId}?isActive=0`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );
            const data = response.data;

            if (data.success) {
                navigate("/login");
            };
        } catch (error) {
            console.log("Login error:", error);
            if (error.response.data) {
                setErrorMessage(error.response.data.message);
                alert(errorMessage);
            };
        };
    };

    return (
        <header className="clinic-header">
            <div className="clinic-logo">🏥 MyClinic</div>
            <nav className="clinic-nav">
                <NavLink to="/appointments">Appointments</NavLink>
                {isAdmin && <NavLink className='dashboard-link' to="/">Dashboard</NavLink>}
                <NavLink to="/account">Account</NavLink>

                {!token ? (
                    <>
                        <button onClick={() => navigate('/register')} className="login-btn">SignUp</button>
                        <button onClick={() => navigate('/login')} className="login-btn">Login</button>
                    </>
                ) : (
                    <button  onClick={() => {handleLogout()}} className="logOut-btn">LogOut</button>
                )}
            </nav>
        </header>
    );
}

export default Header;
