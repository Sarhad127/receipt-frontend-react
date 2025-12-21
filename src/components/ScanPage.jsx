import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { rescanReceipt, uploadReceipt, saveReceipt, deleteHistoryReceipt } from "./api/apis.jsx";
import { fetchUserInfo } from "./api/apis.jsx";
import { useScan } from "../context/ScanContext.jsx";

import "./style/pages/ScanPage.css";
import "./style/AppLayout.css";

function ScanPage() {
    const { uploadedFile, setUploadedFile, uploadedImage, setUploadedImage, ocrData, setOcrData, selectedReceiptId, setSelectedReceiptId } = useScan();
    const [username, setUsername] = useState("");
    const [saving, setSaving] = useState(false);
    const [viewMode, setViewMode] = useState("list");
    const navigate = useNavigate();
    const effectRan = useRef(false);

    useEffect(() => {
        if (effectRan.current) return;
        effectRan.current = true;

        const loadUser = async () => {
            try {
                const data = await fetchUserInfo();
                setUsername(data.username);
            } catch (err) {
                console.error("Failed to fetch user info:", err);
                localStorage.removeItem("jwt");
                sessionStorage.removeItem("jwt");
                navigate("/");
            }
        };

        loadUser();
    }, [navigate]);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadedFile(file);
        setUploadedImage(URL.createObjectURL(file));

        try {
            const result = await uploadReceipt(file);
            setOcrData(result);
            if (result.receiptId) setSelectedReceiptId(result.receiptId);
        } catch (err) {
            console.error("Upload failed:", err);
        }
    };

    const handleRescan = async () => {
        if (!uploadedFile) return;

        try {
            const data = await rescanReceipt(uploadedFile);
            setOcrData(data);
        } catch (err) {
            console.error("Rescan failed:", err);
        }
    };

    const handleSave = async () => {
        if (!selectedReceiptId || saving) return;

        try {
            setSaving(true);
            await saveReceipt(selectedReceiptId);

            setUploadedFile(null);
            setUploadedImage(null);
            setOcrData(null);
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

        try {
            await deleteHistoryReceipt(selectedReceiptId);

            setUploadedFile(null);
            setUploadedImage(null);
            setOcrData(null);
            setSelectedReceiptId(null);

        } catch (err) {
            console.error(err);
            alert("Kunde inte ta bort kvittot.");
        }
    };

    return (
        <div className="page-wrapper">
            <div className="page-tabs">
                <button className="tab active">Skanna</button>
                <button className="tab" onClick={() => navigate("/historik")}>Historik</button>
                <button className="tab" onClick={() => navigate("/sparade")}>Sparade</button>
                <button className="tab" onClick={() => navigate("/statistik")}>Statistik</button>
                <button className="tab" onClick={() => navigate("/installningar")}>Inställningar</button>
            </div>

            <div className="page-container">
                <div className="page-content scan-content">
                    <div className="upload-section">
                        <div className="scroll-inner">
                            <h2>Ladda upp kvitto</h2>
                            <input type="file" accept="image/*" onChange={handleUpload} />
                            <p>Dra och släpp fil här eller klicka för att välja bild</p>

                            {uploadedImage && (
                                <img
                                    src={uploadedImage}
                                    alt="Uploaded receipt"
                                    className="uploaded-image"
                                />
                            )}
                        </div>
                    </div>

                    <div className="info-section">
                        <div>
                            <h2>Skannad information</h2>
                            <div className="action-buttons">
                                <button className="toggle-btn" onClick={handleRescan}>Skanna igen</button>
                                <button className="toggle-btn" onClick={handleSave} disabled={saving || !selectedReceiptId}>Spara</button>
                                <button className="toggle-btn" onClick={handleDelete}>Radera</button>
                            </div>

                            <div className="view-toggle">
                                <button className={`toggle-btn ${viewMode === "list" ? "active" : ""}`} onClick={() => setViewMode("list")}>Lista</button>
                                <button className={`toggle-btn ${viewMode === "raw" ? "active" : ""}`} onClick={() => setViewMode("raw")}>Raw</button>
                            </div>
                        </div>

                        {ocrData ? (
                            viewMode === "raw" ? (
                                <pre>{ocrData.ocr?.ocr_text || "Inget OCR-resultat"}</pre>
                            ) : (
                                <div className="receipt-dto">
                                    <h3>{ocrData.receipt?.vendorName || "Okänd butik"}</h3>
                                    <p><strong>Org.nr:</strong> {ocrData.receipt?.vendorOrgNumber || "-"}</p>
                                    <p><strong>Adress:</strong> {ocrData.receipt?.vendorAddress || "-"}</p>
                                    <p><strong>Kvittonr:</strong> {ocrData.receipt?.receiptNumber || "-"}</p>
                                    <p><strong>Betalmetod:</strong> {ocrData.receipt?.paymentMethod || "-"}</p>
                                    <p><strong>Valuta:</strong> {ocrData.receipt?.currency || "-"}</p>
                                    <p><strong>Total:</strong> {ocrData.receipt?.totalAmount ?? "-"}</p>
                                    <p><strong>Moms:</strong> {ocrData.receipt?.vatAmount ?? "-"}</p>

                                    {ocrData.receipt?.items?.length > 0 && (
                                        <table className="receipt-items-table">
                                            <thead>
                                            <tr>
                                                <th>Artikel</th>
                                                <th>Antal</th>
                                                <th>Enhetspris</th>
                                                <th>Totalt</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {ocrData.receipt.items.map((item, index) => (
                                                <tr key={index}>
                                                    <td>{item.itemName}</td>
                                                    <td>{item.itemQuantity}</td>
                                                    <td>{item.itemUnitPrice}</td>
                                                    <td>{item.itemTotalPrice}</td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            )
                        ) : (
                            <p>Här visas all OCR-skannad information från kvittot.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ScanPage;
