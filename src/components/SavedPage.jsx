import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./style/pages/SavedPage.css";
import "./style/AppLayout.css";
import {
    fetchSavedReceipts,
    fetchReceiptImage,
    fetchSavedReceiptData
} from "./api/apis";

function SavedPage() {
    const navigate = useNavigate();
    const [receipts, setReceipts] = useState([]);
    const [images, setImages] = useState({});
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [ocrData, setOcrData] = useState(null);

    useEffect(() => {
        const loadReceipts = async () => {
            try {
                const data = await fetchSavedReceipts();
                setReceipts(data);

                const imageMap = {};
                for (const r of data) {
                    const imgUrl = await fetchReceiptImage(r.id);
                    if (imgUrl) imageMap[r.id] = imgUrl;
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

    const handleReceiptClick = async (receipt) => {
        setSelectedReceipt(receipt);
        setModalOpen(true);

        try {
            const data = await fetchSavedReceiptData(receipt.id);
            setOcrData(data);
        } catch (err) {
            console.error("Kunde inte hämta OCR-data:", err);
            setOcrData(null);
        }
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedReceipt(null);
        setOcrData(null);
    };

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
                    {receipts.length === 0 ? null : (
                        <ul className="receipt-list">
                            {receipts.map(r => (
                                <li
                                    key={r.id}
                                    className="receipt-item"
                                    onClick={() => handleReceiptClick(r)}
                                    style={{ cursor: "pointer" }}
                                >
                                    <p>{new Date(r.createdAt).toLocaleDateString()}</p>
                                    {images[r.id] ? (
                                        <img
                                            src={images[r.id]}
                                            alt="Kvitto"
                                            className="receipt-image"
                                        />
                                    ) : <p>Laddar bild...</p>}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {modalOpen && selectedReceipt && (
                <div className="saved-modal-overlay" onClick={closeModal}>
                    <div className="saved-modal-content" onClick={e => e.stopPropagation()}>
                        <button className="saved-modal-close" onClick={closeModal}>×</button>

                        {images[selectedReceipt.id] ? (
                            <img
                                src={images[selectedReceipt.id]}
                                alt="Kvitto"
                                className="saved-modal-image"
                            />
                        ) : <p>Laddar bild...</p>}

                        {ocrData ? (
                            <div className="saved-ocr-info">
                                <p><strong>Butik:</strong> {ocrData.vendorName}</p>
                                <p><strong>Org.nr:</strong> {ocrData.vendorOrgNumber}</p>
                                <p><strong>Adress:</strong> {ocrData.vendorAddress}</p>
                                <p><strong>Datum:</strong> {ocrData.receiptDate}</p>
                                <p><strong>Kvittonummer:</strong> {ocrData.receiptNumber}</p>
                                <p><strong>Totalt belopp:</strong> {ocrData.totalAmount} {ocrData.currency}</p>
                                <p><strong>Moms:</strong> {ocrData.vatAmount} {ocrData.currency}</p>
                                <p><strong>Betalningsmetod:</strong> {ocrData.paymentMethod}</p>
                                {ocrData.notes && <p><strong>Anteckningar:</strong> {ocrData.notes}</p>}

                                <p><strong>Artiklar:</strong></p>
                                {ocrData.items && ocrData.items.length > 0 ? (
                                    <ul>
                                        {ocrData.items.map((item, idx) => (
                                            <li key={idx}>
                                                {item.itemName} – {item.itemQuantity} × {item.itemUnitPrice} = {item.itemTotalPrice}
                                            </li>
                                        ))}
                                    </ul>
                                ) : <p>Inga artiklar</p>}
                            </div>
                        ) : <p>Laddar OCR-data...</p>}
                    </div>
                </div>
            )}
        </div>
    );
}

export default SavedPage;