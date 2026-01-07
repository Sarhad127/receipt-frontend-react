import React, { useState } from "react";
import "./style/AppLayout.css";
import "./style/pages/LoginPage.css";
import RegisterPage from "./RegisterPage";
import { useNavigate } from "react-router-dom";
import { loginUser } from "./api/apis";

function LoginPage() {
    const navigate = useNavigate();
    const [showRegister, setShowRegister] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);

    if (showRegister) {
        return <RegisterPage onBack={() => setShowRegister(false)} />;
    }

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const data = await loginUser(username, password);

            if (rememberMe) {
                localStorage.setItem("jwt", data.token);
            } else {
                sessionStorage.setItem("jwt", data.token);
            }

            navigate("/skanna");
        } catch (err) {
            console.log(err.message);
        }
    };

    return (
        <div className="page-wrapper">

            <div className="page-tabs login-tabs">
                <button className="tab active">Login</button>
                <button className="tab" onClick={() => navigate("/skanna")}>Skanna</button>
                <button className="tab" onClick={() => navigate("/historik")}>Historik</button>
                <button className="tab" onClick={() => navigate("/sparade")}>Sparade</button>
                <button className="tab" onClick={() => navigate("/statistik")}>Statistik</button>
                <button className="tab" onClick={() => navigate("/installningar")}>Inställningar</button>
            </div>

            <div className="page-container">
                <div className="page-content login-content">
                    <div className="login-form-container">
                        <h2>Logga in</h2>

                        <form className="login-form" onSubmit={handleLogin}>
                            <input
                                type="text"
                                placeholder="Användarnamn"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
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