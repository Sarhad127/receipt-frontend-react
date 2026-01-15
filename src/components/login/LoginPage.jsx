import React, { useState } from "react";
import "../style/AppLayout.css";
import "./css/LoginPage.css";
import RegisterPage from "./RegisterPage.jsx";
import { useNavigate } from "react-router-dom";
import { loginUser, resendCode } from "../api/apis.jsx";
import receiptBg from "./images/receipt-bg.jpg";

function LoginPage() {
    const navigate = useNavigate();
    const [showRegister, setShowRegister] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    if (showRegister) {
        return (
            <RegisterPage
                onBack={() => setShowRegister(false)}
                onSuccess={() => setShowRegister(false)}
            />
        );
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
            navigate("/kvitton");

        } catch (err) {

            let message = "Något gick fel. Försök igen.";

            if (err.status === 401) {
                message = "Fel lösenord.";
            } else if (err.status === 404) {
                message = "E-postadressen är inte registrerad.";
            } else if (err.status === 403) {
                message = "Kontot är inte verifierat.";
            } else if (err.message) {
                message = err.message;
            }

            setToastMessage(message);
            setTimeout(() => setToastMessage(""), 3000);
        }
    };

    return (
        <div className="page-wrapper">
            {toastMessage && <div className="toast-popup">{toastMessage}</div>}

            <div className="page-content login-content">
                <div
                    className="left-login-panel"
                    style={{
                        backgroundImage: `
                                          linear-gradient(135deg, rgba(12, 24, 48, 0.95), rgba(28, 64, 120, 0.95)),
                                          url(${receiptBg})
                                        `
                    }}
                >

                <div className="left-panel-overlay">

                        <h1 className="left-title">Huskvitton</h1>

                        <div className="feature-list">
                            <div className="feature-item">
                                <span>📁</span>
                                <p>Spara alla dina kvitton på ett ställe</p>
                            </div>

                            <div className="feature-item">
                                <span>🔍</span>
                                <p>Hitta gamla kvitton på sekunder</p>
                            </div>

                            <div className="feature-item">
                                <span>📊</span>
                                <p>Få tydlig överblick över dina utgifter</p>
                            </div>

                            <div className="feature-item">
                                <span>🔐</span>
                                <p>Säker lagring med trygg inloggning</p>
                            </div>
                        </div>
                        <p className="left-footer-text">
                            Organisera ditt kvittokaos - enkelt och smart.
                        </p>
                    </div>
                </div>

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
    );
}

export default LoginPage;