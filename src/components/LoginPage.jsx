import React, { useState } from "react";
import "./style/AppLayout.css";
import "./style/pages/LoginPage.css";
import RegisterPage from "./RegisterPage";
import { useNavigate } from "react-router-dom";
import {loginUser, resendCode} from "./api/apis";

function LoginPage() {
    const navigate = useNavigate();
    const [showRegister, setShowRegister] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [toastMessage, setToastMessage] = useState("");

    const isLoggedIn = () => {
        return !!localStorage.getItem("jwt") || !!sessionStorage.getItem("jwt");
    };

    if (showRegister) {
        return <RegisterPage onBack={() => setShowRegister(false)} />;
    }

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const data = await loginUser({ email, password, rememberMe });
            if (data.enabled === false || data.enabled === "false") {
                await resendCode(email);
                navigate("/verify", { state: { email } });
                return;
            }

            if (rememberMe) {
                localStorage.setItem("jwt", data.token);
            } else {
                sessionStorage.setItem("jwt", data.token);
            }

            navigate("/skanna");
        } catch (err) {
            console.log(err.message);
            setToastMessage(err.message);
            setTimeout(() => setToastMessage(""), 3000);
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
                <button className="tab active">Login</button>
                <button className="tab" onClick={() => handleNavClick("/skanna")}>Skanna</button>
                <button className="tab" onClick={() => handleNavClick("/historik")}>Historik</button>
                <button className="tab" onClick={() => handleNavClick("/sparade")}>Sparade</button>
                <button className="tab" onClick={() => handleNavClick("/statistik")}>Statistik</button>
                <button className="tab" onClick={() => handleNavClick("/installningar")}>Inställningar</button>
            </div>

            {toastMessage && (
                <div className="toast-popup">
                    {toastMessage}
                </div>
            )}

            <div className="page-container">
                <div className="page-content login-content">
                    <div className="login-form-container">
                        <h2>Logga in</h2>

                        <form className="login-form" onSubmit={handleLogin}>
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

                            <label className="remember-me">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                Kom ihåg mig
                            </label>

                            <button type="submit">Logga in</button>
                        </form>

                        <button
                            className="register-btn"
                            onClick={() => setShowRegister(true)}
                        >
                            Registrera
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;