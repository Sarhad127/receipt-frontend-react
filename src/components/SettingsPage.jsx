import React from "react";
import { useNavigate } from "react-router-dom";
import "./style/pages/SettingsPage.css";
import "./style/AppLayout.css";

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
                    <div className="sidebar-item" onClick={() => navigate("/kvitton")}>Kvitton</div>
                    <div className="sidebar-item" onClick={() => navigate("/historik")}>Historik</div>
                    <div className="sidebar-item" onClick={() => navigate("/statistik")}>Statistik</div>
                    <div className="sidebar-item active">Inställningar</div>
                </nav>
            </aside>

            <div className="page-container">
                <div className="page-content">
                    <button className="logout-button" onClick={handleLogout}>
                        Logga ut
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SettingsPage;
