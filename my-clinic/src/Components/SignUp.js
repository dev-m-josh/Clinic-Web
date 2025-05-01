import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import '../Styles/Login.css'

export default function SignUp() {
    const navigate = useNavigate();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [gender, setGender] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Password toggle
    const togglePassword = () => setShowPassword((prev) => !prev);
    const toggleConfirmPassword = () => setShowConfirmPassword((prev) => !prev);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");

        if (!email.match(/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/)) {
            setErrorMessage("Invalid email address!");
            return;
        };

        if (!phoneNumber.match(/^07\d{8}$/)) {
            setErrorMessage("Invalid phone number!");
            return;
        };

        if (password.length < 8) {
            setErrorMessage("Password should be at least 8 characters long");
            return;
        };

        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match!");
            return;
        };

        const userDetails = {
            FirstName: firstName,
            LastName: lastName,
            Gender: gender,
            Email: email,
            PhoneNumber: phoneNumber,
            UserPassword: password
        };

        try {
            const response = await axios.post(
                "http://localhost:4500/users",
                 userDetails
            );

            const data = response.data;

            localStorage.setItem("myToken", data.token);

            const signedUpUser = {
                UserId: data.addedUser.UserId,
                FirstName: data.addedUser.FirstName,
                LastName: data.addedUser.LastName,
                Gender: data.addedUser.Gender,
                Email: data.addedUser.Email,
                PhoneNumber: data.addedUser.PhoneNumber,
                UserRole: data.addedUser.UserRole,
                isActive: data.addedUser.isActive
            };

            localStorage.setItem("myUser", JSON.stringify(signedUpUser));
            const storedUser = JSON.parse(localStorage.getItem("myUser"));

            navigate("/");
            
        } catch (error) {
            console.error("There was an error during sign-up", error);
            setErrorMessage("An error occurred. Please try again.");
        };

    };

    return(
        <div className="login-form">
            <h2>Sign Up</h2>
            <form onSubmit={handleSubmit}>
                <div className="user-details">
                    <label htmlFor="firstName">FirstName:</label>
                    <input
                        type="text"
                        id="firstName"
                        value={firstName}
                        onChange={(e) => {
                            const value = e.target.value;
                            setFirstName(value.charAt(0).toUpperCase() + value.slice(1));
                        }}
                        required
                    />
                </div>
                <div className="user-details">
                    <label htmlFor="lastName">LastName:</label>
                    <input
                        type="text"
                        id="lastName"
                        value={lastName}
                        onChange={(e) => {
                            const value = e.target.value;
                            setLastName(value.charAt(0).toUpperCase() + value.slice(1));
                        }}
                        required
                    />
                </div>
                <div className="user-details">
                    <label htmlFor="gender">Gender:</label>
                    <select
                        id="gender"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        required
                    >
                        <option value="" disabled>Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>
                </div>
                <div className="user-details">
                    <label htmlFor="phoneNumber">Phone Number:</label>
                    <input
                        type="tel"
                        id="phoneNumber"
                        value={phoneNumber}
                        onChange={(e) => {
                            const value = e.target.value;
                            setPhoneNumber(value);
                        }}
                        required
                    />
                </div>
                <div className="user-details">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="user-details">
                    <label htmlFor="password">Password:</label>
                    <div>
                    <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button className="password-visibility" type="button" onClick={togglePassword}>
                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                    </button>
                    </div>
                </div>
                <div className="user-details">
                    <label htmlFor="confirmPassword">Confirm Password:</label>
                    <div>
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                    <button className="password-visibility" type="button" onClick={toggleConfirmPassword}>
                        <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                    </button>
                    </div>
                </div>

                {errorMessage && <p
                 style={{color: "red"}}>
                 {errorMessage}
                </p>}
                
                <div className="navigate">
                    <p>
                        If you already have an account try logging in.<button onClick={() => navigate("/login")}>Login</button>     
                    </p>
                </div>

                <div className="submit-btn">
                    <button type="submit">
                        Sign Up
                    </button>
                </div>
            </form>
        </div>
    )
};