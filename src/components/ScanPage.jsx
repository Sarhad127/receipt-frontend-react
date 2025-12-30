import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    rescanReceipt,
    uploadReceipt,
    saveReceipt,
    deleteHistoryReceipt,
    fetchHistoryReceiptFile
} from "./api/apis.jsx";
import { fetchUserInfo } from "./api/apis.jsx";
import { useScan } from "../context/ScanContext.jsx";
import { useLocation } from "react-router-dom";

import "./style/pages/ScanPage.css";
import "./style/pages/stylingparts/scanRightSide.css";
import "./style/AppLayout.css";

function ScanPage() {
    const { uploadedFile, setUploadedFile, uploadedImage, setUploadedImage, ocrData, setOcrData, selectedReceiptId, setSelectedReceiptId } = useScan();
    const [username, setUsername] = useState("");
    const [saving, setSaving] = useState(false);
    const [viewMode, setViewMode] = useState("dto");
    const navigate = useNavigate();
    const effectRan = useRef(false);
    const [editableReceipt, setEditableReceipt] = useState(null);
    const location = useLocation();

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

    useEffect(() => {
        if (ocrData?.receipt) {
            setEditableReceipt(JSON.parse(JSON.stringify(ocrData.receipt)));
        }
    }, [ocrData]);

    useEffect(() => {
        const receiptIdFromHistory = location.state?.receiptId;
        if (receiptIdFromHistory) {
            setSelectedReceiptId(receiptIdFromHistory);

            const fetchReceiptData = async () => {
                try {
                    const file = await fetchHistoryReceiptFile(receiptIdFromHistory);
                    setUploadedImage(URL.createObjectURL(file));

                    const ocrResult = await rescanReceipt(receiptIdFromHistory, file);
                    setOcrData(ocrResult);

                    if (ocrResult.receipt) {
                        setEditableReceipt(JSON.parse(JSON.stringify(ocrResult.receipt)));
                    }
                } catch (err) {
                    console.error("Failed to fetch receipt from history:", err);
                }
            };

            fetchReceiptData();
        }
    }, [location.state]);

    const handleInputChange = (field, value) => {
        setEditableReceipt(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...editableReceipt.items];
        newItems[index] = {
            ...newItems[index],
            [field]: value,
            itemTotalPrice:
                (field === "itemQuantity" ? value : newItems[index].itemQuantity) *
                (field === "itemUnitPrice" ? value : newItems[index].itemUnitPrice)
        };
        setEditableReceipt(prev => ({
            ...prev,
            items: newItems
        }));
    };

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
        if (!uploadedFile || !selectedReceiptId) return;

        try {
            const data = await rescanReceipt(selectedReceiptId, uploadedFile);
            setOcrData(data);

            if (data.receipt) {
                setEditableReceipt(JSON.parse(JSON.stringify(data.receipt)));
            }

        } catch (err) {
            console.error("Rescan failed:", err);
        }
    };

    const handleSave = async () => {
        if (!selectedReceiptId || saving) return;

        try {
            setSaving(true);
            await saveReceipt(selectedReceiptId, editableReceipt);

            setUploadedFile(null);
            setUploadedImage(null);
            setOcrData(null);
            setSelectedReceiptId(null);
            setEditableReceipt(null);
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
            setEditableReceipt(null)

        } catch (err) {
            console.error(err);
            alert("Kunde inte ta bort kvittot.");
        }
    };

    const handleNewScan = () => {
        setUploadedFile(null);
        setUploadedImage(null);
        setOcrData(null);
        setSelectedReceiptId(null);
        setEditableReceipt(null);
    };

    const handleItemRemove = (index) => {
        setEditableReceipt(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
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

                            <div className="action-buttons">
                                <button className="toggle-btn" onClick={handleNewScan}>Ny Kvitto</button>
                                <button className="toggle-btn" onClick={handleRescan}>Skanna igen</button>
                                <button
                                    className="toggle-btn"
                                    onClick={handleSave}
                                    disabled={saving || !selectedReceiptId}
                                >
                                    Spara
                                </button>
                                <button className="toggle-btn" onClick={handleDelete}>Radera</button>
                            </div>

                            <div className="view-toggle">
                                <button
                                    className={`toggle-btn ${viewMode === "dto" ? "active" : ""}`}
                                    onClick={() => setViewMode("dto")}
                                >
                                    Kvittodetaljer
                                </button>
                                <button
                                    className={`toggle-btn ${viewMode === "raw" ? "active" : ""}`}
                                    onClick={() => setViewMode("raw")}
                                >
                                    Raw OCR
                                </button>
                            </div>
                        </div>

                        <div className="info-scroll">
                            {editableReceipt ? (
                                viewMode === "raw" ? (
                                    <pre>{ocrData.ocr?.ocr_text || "Inget OCR-resultat"}</pre>
                                ) : (
                                    <div className="receipt-dto">
                                        <h3>
                                            <input
                                                type="text"
                                                value={editableReceipt.vendorName || ""}
                                                onChange={e =>
                                                    handleInputChange("vendorName", e.target.value)
                                                }
                                            />
                                        </h3>

                                        <p><strong>Org.nr:</strong>
                                            <input
                                                type="text"
                                                value={editableReceipt.vendorOrgNumber || ""}
                                                onChange={e =>
                                                    handleInputChange("vendorOrgNumber", e.target.value)
                                                }
                                            />
                                        </p>

                                        <p><strong>Adress:</strong>
                                            <input
                                                type="text"
                                                value={editableReceipt.vendorAddress || ""}
                                                onChange={e =>
                                                    handleInputChange("vendorAddress", e.target.value)
                                                }
                                            />
                                        </p>

                                        <p><strong>Kvittonr:</strong>
                                            <input
                                                type="text"
                                                value={editableReceipt.receiptNumber || ""}
                                                onChange={e =>
                                                    handleInputChange("receiptNumber", e.target.value)
                                                }
                                            />
                                        </p>

                                        <p><strong>Betalmetod:</strong>
                                            <input
                                                type="text"
                                                value={editableReceipt.paymentMethod || ""}
                                                onChange={e =>
                                                    handleInputChange("paymentMethod", e.target.value)
                                                }
                                            />
                                        </p>

                                        <p><strong>Valuta:</strong>
                                            <input
                                                type="text"
                                                value={editableReceipt.currency || ""}
                                                onChange={e =>
                                                    handleInputChange("currency", e.target.value)
                                                }
                                            />
                                        </p>

                                        <p><strong>Total:</strong>
                                            <input
                                                type="number"
                                                value={editableReceipt.totalAmount ?? ""}
                                                onChange={e =>
                                                    handleInputChange("totalAmount", e.target.value)
                                                }
                                            />
                                        </p>

                                        <p><strong>Moms:</strong>
                                            <input
                                                type="number"
                                                value={editableReceipt.vatAmount ?? ""}
                                                onChange={e =>
                                                    handleInputChange("vatAmount", e.target.value)
                                                }
                                            />
                                        </p>

                                        {editableReceipt.items?.length > 0 && (
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
                                                {editableReceipt.items.map((item, index) => (
                                                    <tr key={index}>
                                                        <td>
                                                            <input
                                                                type="text"
                                                                value={item.itemName}
                                                                onChange={e => handleItemChange(index, "itemName", e.target.value)}
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="number"
                                                                value={item.itemQuantity}
                                                                onChange={e => handleItemChange(index, "itemQuantity", e.target.value)}
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="number"
                                                                value={item.itemUnitPrice}
                                                                onChange={e => handleItemChange(index, "itemUnitPrice", e.target.value)}
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="number"
                                                                value={item.itemTotalPrice}
                                                                readOnly
                                                            />
                                                        </td>
                                                        <td>
                                                            <button type="button" onClick={() => handleItemRemove(index)}>
                                                                Ta bort
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newItem = { itemName: "", itemQuantity: 1, itemUnitPrice: 0, itemTotalPrice: 0 };
                                                        setEditableReceipt(prev => ({
                                                            ...prev,
                                                            items: [...(prev.items || []), newItem]
                                                        }));
                                                    }}
                                                >
                                                    Lägg till artikel
                                                </button>
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                )
                            ) : (
                                <div className="right-side-text">
                                    <h2>Skannad information</h2>
                                    <p>Här visas all OCR-skannad information från kvittot.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ScanPage;