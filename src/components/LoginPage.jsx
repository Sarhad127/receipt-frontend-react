import React, { useState } from "react";
import "./style/AppLayout.css";
import "./style/pages/LoginPage.css";
import RegisterPage from "./RegisterPage";
import { useNavigate } from "react-router-dom";
import { loginUser, resendCode } from "./api/apis";

function LoginPage() {
    const navigate = useNavigate();
    const [showRegister, setShowRegister] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);

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
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <img
                        src="/src/components/style/icons/receipt-icon.png"
                        alt="Kvitto ikon"
                    />
                    <span>Huskvitton</span>
                </div>

                <nav className="sidebar-nav">
                    <div className="sidebar-item active">Login</div>
                    <div className="sidebar-item" onClick={() => handleNavClick("/skanna")}>Skanna</div>
                    <div className="sidebar-item" onClick={() => handleNavClick("/historik")}>Historik</div>
                    <div className="sidebar-item" onClick={() => handleNavClick("/sparade")}>Sparade</div>
                    <div className="sidebar-item" onClick={() => handleNavClick("/statistik")}>Statistik</div>
                    <div className="sidebar-item" onClick={() => handleNavClick("/installningar")}>Inställningar</div>
                </nav>
            </aside>
            {toastMessage && <div className="toast-popup">{toastMessage}</div>}

            <div className="page-container">
                <div className="page-content login-content">
                    <div className="login-form-container">
                        <div className="login-title-container">
                            <img
                                src="/src/components/style/icons/receipt-icon.png"
                                alt="Kvitto ikon"
                                className="login-title-icon"
                            />
                            <h1 className="login-titel">Huskvitton</h1>
                        </div>

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
                                type={showPassword ? "text" : "password"}
                                placeholder="Lösenord"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />

                            <div className="login-checkbox-wrapper">
                                <label className="remember-me">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                    />
                                    Kom ihåg mig
                                </label>

                                <label className="remember-me">
                                    <input
                                        type="checkbox"
                                        checked={showPassword}
                                        onChange={(e) => setShowPassword(e.target.checked)}
                                    />
                                    Visa lösenord
                                </label>
                            </div>

                            <button type="submit">Logga in</button>
                        </form>

                        <div className="register-label-wrapper">
                            <span>Har du inget konto än? </span>
                            <span
                                className="register-link"
                                onClick={() => setShowRegister(true)}
                            >
                                Registrera dig
                            </span>
                        </div>

                    </div>
                </div>
            </div>

        </div>
    );
}

export default LoginPage;
