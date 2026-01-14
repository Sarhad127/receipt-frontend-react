import React from "react";
import { useNavigate } from "react-router-dom";
import "./style/pages/SettingsPage.css";
import "./style/AppLayout.css";
import receiptsIcon from "./icons/receipt.png";
import historyIcon from "./icons/history.png";
import statsIcon from "./icons/analytics.png";
import settingsIcon from "./icons/settings.png";
import ThemeToggle from "./ThemeToggle.jsx";

function SettingsPage() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("jwt");
        sessionStorage.removeItem("jwt");
        navigate("/");
    };

    return (
        <div className="page-wrapper">
            <aside className="sidebar">
                <h1 className="sidebar-title">Huskvitton</h1>
                <nav className="sidebar-nav">
                    <div className="sidebar-item" onClick={() => navigate("/kvitton")}>
                        <img src={receiptsIcon} alt="Kvitton" className="sidebar-icon" />
                        Kvitton
                    </div>
                    <div className="sidebar-item" onClick={() => navigate("/historik")}>
                        <img src={historyIcon} alt="Historik" className="sidebar-icon" />
                        Historik
                    </div>
                    <div className="sidebar-item" onClick={() => navigate("/statistik")}>
                        <img src={statsIcon} alt="Statistik" className="sidebar-icon" />
                        Statistik
                    </div>
                    <div className="sidebar-item active" onClick={() => navigate("/installningar")}>
                        <img src={settingsIcon} alt="Inställningar" className="sidebar-icon" />
                        Inställningar
                    </div>
                </nav>
            </aside>

            <div className="page-container">
                <div className="page-content">
                    <ThemeToggle />
                    <button className="logout-button" onClick={handleLogout}>
                        Logga ut
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SettingsPage;
