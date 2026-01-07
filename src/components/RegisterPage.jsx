import React, { useState } from "react";
import "./style/AppLayout.css";
import "./style/pages/RegisterPage.css";
import { registerUser } from "./api/apis";
import { useNavigate } from "react-router-dom";

function RegisterPage({ onBack }) {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [toastMessage, setToastMessage] = useState("");

    const isLoggedIn = () => {
        return !!localStorage.getItem("jwt") || !!sessionStorage.getItem("jwt");
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            console.log("Passwords do not match!");
            return;
        }

        try {
            await registerUser(email, password);
            navigate("/verify", { state: { email } });
        } catch (err) {
            console.log(err.message);
        }
    };

    const handleNavClick = (path) => {
        if (!isLoggedIn()) {
            setToastMessage("Logga in för att komma åt den här sidan");
            setTimeout(() => setToastMessage(""), 2000);
            return;
        }
        navigate(path);
    };

    return (
        <div className="page-wrapper">

            <div className="page-tabs login-tabs">
                <button className="tab active">Register</button>
                <button className="tab" onClick={() => handleNavClick("/skanna")}>Skanna</button>
                <button className="tab" onClick={() => handleNavClick("/historik")}>Historik</button>
                <button className="tab" onClick={() => handleNavClick("/sparade")}>Sparade</button>
                <button className="tab" onClick={() => handleNavClick("/statistik")}>Statistik</button>
                <button className="tab" onClick={() => handleNavClick("/installningar")}>Inställningar</button>
            </div>

            {toastMessage && <div className="toast-popup">{toastMessage}</div>}

            <div className="page-container">
                <div className="page-content login-content">
                    <div className="register-form-container">
                        <h2>Registrera</h2>

                        <form className="register-form" onSubmit={handleRegister}>
                            <input
                                type="email"
                                placeholder="E-post"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <input
                                type="password"
                                placeholder="Lösenord"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <input
                                type="password"
                                placeholder="Bekräfta Lösenord"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />

                            <button type="submit">Registrera</button>
                        </form>

                        <button className="back-btn" onClick={onBack}>
                            Tillbaka till inloggning
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;