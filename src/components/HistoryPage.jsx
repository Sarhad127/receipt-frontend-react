import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./style/pages/HistoryPage.css";
import "./style/AppLayout.css";

function HistoryPage() {
    const navigate = useNavigate();
    const [receipts, setReceipts] = useState([]);
    const [images, setImages] = useState({});
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedReceiptId, setSelectedReceiptId] = useState(null);
    const [saving, setSaving] = useState(false);

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

    const handleSave = async () => {
        if (!selectedReceiptId || saving) return;

        const token = localStorage.getItem("jwt") || sessionStorage.getItem("jwt");
        if (!token) return;

        try {
            setSaving(true);

            const res = await fetch(
                `http://localhost:8080/savings/${selectedReceiptId}`,
                {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );

            if (!res.ok) {
                throw new Error("Failed to save receipt");
            }

            alert("Kvitto sparat!");
            setSelectedImage(null);
            setSelectedReceiptId(null);

        } catch (err) {
            console.error(err);
            alert("Kunde inte spara kvittot");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedReceiptId) return;

        const token = localStorage.getItem("jwt") || sessionStorage.getItem("jwt");
        if (!token) return;

        if (!window.confirm("Är du säker på att du vill ta bort detta kvitto?")) return;

        try {
            const res = await fetch(`http://localhost:8080/history/${selectedReceiptId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!res.ok) throw new Error("Failed to delete receipt");

            setReceipts(prev => prev.filter(r => r.id !== selectedReceiptId));
            setImages(prev => {
                const newImages = { ...prev };
                delete newImages[selectedReceiptId];
                return newImages;
            });

            setSelectedImage(null);
            setSelectedReceiptId(null);

            alert("Kvitto borttaget!");
        } catch (err) {
            console.error(err);
            alert("Kunde inte ta bort kvittot.");
        }
    };

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
                                            onClick={() => {
                                                setSelectedImage(images[r.id]);
                                                setSelectedReceiptId(r.id);
                                            }}
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
            {selectedImage && (
                <div className="modal-overlay" onClick={() => setSelectedImage(null)}>

                    <div className="modal-actions-bar" onClick={e => e.stopPropagation()}>
                        <button
                            className="modal-action-btn"
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? "Sparar..." : "Spara"}
                        </button>
                        <button className="modal-action-btn">Skanna igen</button>
                        <button
                            className="modal-action-btn danger"
                            onClick={handleDelete}
                        >
                            Radera
                        </button>
                    </div>

                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <button
                            className="modal-close"
                            onClick={() => setSelectedImage(null)}
                        >
                            ✕
                        </button>

                        <img
                            src={selectedImage}
                            alt="Förstorad kvittobild"
                            className="modal-image"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default HistoryPage;