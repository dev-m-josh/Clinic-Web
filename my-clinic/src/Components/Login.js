import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import '../Styles/Login.css';

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const togglePassword = () => setShowPassword((prev) => !prev);

    const handleEmailChange = (e) =>{
        setEmail(e.target.value);
    };

    const handlePasswordChange = (e) =>{
        setPassword(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage("");

        try {
            const response = await axios.post(
                "http://localhost:4500/login", {
                Email: email,
                UserPassword: password
            });

            const data = response.data;

            if (data.token) {
                localStorage.setItem("myToken", data.token);

                const loggedInUser = {
                    UserId: data.user.UserId,
                    FirstName: data.user.FirstName,
                    LastName: data.user.LastName,
                    Gender: data.user.Gender,
                    Email: data.user.Email,
                    PhoneNumber: data.user.phoneNumber,
                    UserPassword: data.user.Password,
                    UserRole: data.user.UserRole,
                    isActive: data.user.isActive
                };


                localStorage.setItem("myUser", JSON.stringify(loggedInUser));

                navigate("/");
            };
            
        } catch (error) {
           console.log("Login error:", error);
           if (error.response.data) {
            alert(error.response.data.message);
        } 
        } finally {
            setLoading(false);
        }
    }
    return(
        <div className="login-form">
            <h2>Login Form</h2>
            <form>
                <div className="user-details">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={handleEmailChange}
                        required
                    />
                </div>
                <div className="user-details">
                    <label htmlFor="password">Password:</label>
                    <div>
                    <input
                        className="password-input"
                        type={showPassword ? "text" : "password"}
                        id="password"
                        value={password}
                        onChange={handlePasswordChange}
                        required
                    />
                    <button className="password-visibility" type="button" onClick={togglePassword}>
                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                    </button>
                    </div>
                </div>

                {errorMessage && <div className="error-message">{errorMessage}
                </div>}

                <div className="navigate">
                    <p>
                        If you don't have an account sign up instead.<button onClick={() => navigate("/register")}>Sign Up</button>     
                    </p>
                </div>

                <div  className="submit-btn">
                    <button onClick={handleSubmit} type="submit" disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </div>
            </form>
        </div>
    )
}