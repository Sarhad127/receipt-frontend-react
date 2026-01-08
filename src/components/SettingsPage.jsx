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
                <div className="sidebar-logo">
                    <img src="/src/components/style/icons/receipt-icon.png" alt="Kvitto ikon" />
                    <span>Huskvitton</span>
                </div>

                <nav className="sidebar-nav">
                    <div className="sidebar-item" onClick={() => navigate("/skanna")}>Skanna</div>
                    <div className="sidebar-item" onClick={() => navigate("/historik")}>Historik</div>
                    <div className="sidebar-item" onClick={() => navigate("/sparade")}>Sparade</div>
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
