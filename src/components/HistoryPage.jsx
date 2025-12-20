import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./style/pages/HistoryPage.css";
import "./style/AppLayout.css";

function HistoryPage() {
    const navigate = useNavigate();
    const [receipts, setReceipts] = useState([]);
    const [images, setImages] = useState({});

    useEffect(() => {
        const token = localStorage.getItem("jwt") || sessionStorage.getItem("jwt");
        if (!token) { navigate("/"); return; }

        fetch("http://localhost:8080/history", {
            headers: { "Authorization": `Bearer ${token}` }
        })
            .then(res => {
                if (!res.ok) throw new Error("Unauthorized");
                return res.json();
            })
            .then(async data => {
                setReceipts(data);

                const imageMap = {};
                for (const r of data) {
                    const imgRes = await fetch(`http://localhost:8080/receipts/${r.id}/image`, {
                        headers: { "Authorization": `Bearer ${token}` }
                    });
                    if (imgRes.ok) {
                        const blob = await imgRes.blob();
                        imageMap[r.id] = URL.createObjectURL(blob);
                    }
                }
                setImages(imageMap);
            })
            .catch(() => {
                localStorage.removeItem("jwt");
                sessionStorage.removeItem("jwt");
                navigate("/");
            });
    }, [navigate]);

    return (
        <div className="page-wrapper">
            <div className="page-tabs">
                <button className="tab" onClick={() => navigate("/skanna")}>Skanna</button>
                <button className="tab active">Historik</button>
                <button className="tab" onClick={() => navigate("/sparade")}>Sparade</button>
                <button className="tab" onClick={() => navigate("/statistik")}>Statistik</button>
                <button className="tab" onClick={() => navigate("/installningar")}>Inställningar</button>
            </div>

            <div className="page-container">
                <div className="page-content">

                    {receipts.length === 0 ? (
                        <p>Inga kvitton hittades.</p>
                    ) : (
                        <ul className="receipt-list">
                            {receipts.map(r => (
                                <li key={r.id} className="receipt-item">
                                    <p>
                                        <strong>Datum:</strong>{" "}
                                        {new Date(r.createdAt).toLocaleString()}
                                    </p>
                                    {images[r.id] ? (
                                        <img
                                            src={images[r.id]}
                                            alt="Kvitto"
                                            className="receipt-image"
                                        />
                                    ) : (
                                        <p>Laddar bild...</p>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}

export default HistoryPage;