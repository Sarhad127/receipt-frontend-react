import React, { useState } from "react";
import "./style/AppLayout.css";
import "./style/pages/LoginPage.css";
import RegisterPage from "./RegisterPage";
import { useNavigate } from "react-router-dom";

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
            const response = await fetch("http://localhost:8080/authenticate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                throw new Error("Invalid credentials");
            }

            const data = await response.json();

            if (rememberMe) {
                localStorage.setItem("jwt", data.token);
            } else {
                sessionStorage.setItem("jwt", data.token);
            }

            navigate("/home");
        } catch (err) {
            console.log(err.message);
        }
    };

    return (
        <div className="page-wrapper">
            <div className="page-content">
                <div className="login-form-container">
                    <h2>Login</h2>
                    <form className="login-form" onSubmit={handleLogin}>
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <label>
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            Kom ihåg mig
                        </label>
                        <button type="submit">Login</button>
                    </form>
                    <button
                        className="register-btn"
                        onClick={() => setShowRegister(true)}
                    >
                        Register
                    </button>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;