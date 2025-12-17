import React, { useState } from "react";
import "./style/LoginPage.css";
import RegisterPage from "./RegisterPage";

function LoginPage() {
    const [showRegister, setShowRegister] = useState(false);

    if (showRegister) {
        return <RegisterPage onBack={() => setShowRegister(false)} />;
    }

    return (
        <div className="login-container">
            <h2>Login</h2>
            <form>
                <input type="text" placeholder="Username" required />
                <input type="password" placeholder="Password" required />
                <button type="submit">Login</button>
            </form>
            <button className="register-btn" onClick={() => setShowRegister(true)}>
                Register
            </button>
        </div>
    );
}

export default LoginPage;
