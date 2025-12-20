import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./style/pages/SavedPage.css";
import "./style/AppLayout.css";
import {
    fetchSavedReceipts,
    fetchReceiptImage
} from "./api/apis";

function SavedPage() {
    const navigate = useNavigate();
    const [receipts, setReceipts] = useState([]);
    const [images, setImages] = useState({});

    useEffect(() => {
        const loadReceipts = async () => {
            try {
                const data = await fetchSavedReceipts();
                setReceipts(data);

                const imageMap = {};
                for (const r of data) {
                    const imgUrl = await fetchReceiptImage(r.id);
                    if (imgUrl) {
                        imageMap[r.id] = imgUrl;
                    }
                }

                setImages(imageMap);
            } catch (err) {
                localStorage.removeItem("jwt");
                sessionStorage.removeItem("jwt");
                navigate("/");
            }
        };

        loadReceipts();
    }, [navigate]);

    return (
        <div className="page-wrapper">
            <div className="page-tabs">
                <button className="tab" onClick={() => navigate("/skanna")}>Skanna</button>
                <button className="tab" onClick={() => navigate("/historik")}>Historik</button>
                <button className="tab active">Sparade</button>
                <button className="tab" onClick={() => navigate("/statistik")}>Statistik</button>
                <button className="tab" onClick={() => navigate("/installningar")}>Inställningar</button>
            </div>

            <div className="page-container">
                <div className="page-content">
                    {receipts.length === 0 ? (
                        <p>Inga sparade kvitton.</p>
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

export default SavedPage;