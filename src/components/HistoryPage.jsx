import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./style/pages/HistoryPage.css";
import "./style/AppLayout.css";
import {
    fetchHistoryReceipts,
    fetchHistoryReceiptImage,
    saveReceipt,
    deleteHistoryReceipt
} from "./api/apis";

function HistoryPage() {
    const navigate = useNavigate();
    const [receipts, setReceipts] = useState([]);
    const [images, setImages] = useState({});
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedReceiptId, setSelectedReceiptId] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const data = await fetchHistoryReceipts();
                setReceipts(data);

                const imageMap = {};
                for (const r of data) {
                    const imgUrl = await fetchHistoryReceiptImage(r.id);
                    if (imgUrl) {
                        imageMap[r.id] = imgUrl;
                    }
                }
                setImages(imageMap);
            } catch {
                localStorage.removeItem("jwt");
                sessionStorage.removeItem("jwt");
                navigate("/");
            }
        };

        loadHistory();
    }, [navigate]);

    const handleSave = async () => {
        if (!selectedReceiptId || saving) return;

        try {
            setSaving(true);
            await saveReceipt(selectedReceiptId);

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

        if (!window.confirm("Är du säker på att du vill ta bort detta kvitto?")) return;

        try {
            await deleteHistoryReceipt(selectedReceiptId);

            setReceipts(prev => prev.filter(r => r.id !== selectedReceiptId));
            setImages(prev => {
                const updated = { ...prev };
                delete updated[selectedReceiptId];
                return updated;
            });

            setSelectedImage(null);
            setSelectedReceiptId(null);

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