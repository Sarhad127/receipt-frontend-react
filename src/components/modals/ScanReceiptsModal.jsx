import React, { useEffect, useState, useRef } from "react";
import { useScan } from "../../context/ScanContext.jsx";
import {
    rescanReceipt,
    uploadReceipt,
    saveReceipt,
    deleteHistoryReceipt,
    fetchHistoryReceiptFile,
    fetchHistoryReceipts,
    fetchUserInfo
} from "../api/apis.jsx";

import "./css/ScanModal.css";
import "./css/ScanModalRightPanel.css";
import "./css/BothSides.css";

function ScanReceiptsModal({ open, onClose, historyReceiptId = null }) {
    const {
        uploadedFile,
        setUploadedFile,
        uploadedImage,
        setUploadedImage,
        ocrData,
        setOcrData,
        selectedReceiptId,
        setSelectedReceiptId
    } = useScan();

    const [email, setEmail] = useState("");
    const [saving, setSaving] = useState(false);
    const [viewMode, setViewMode] = useState("dto");
    const [editableReceipt, setEditableReceipt] = useState(null);
    const [savedReceipts, setSavedReceipts] = useState([]);
    const effectRan = useRef(false);

    const CATEGORIES = [
        "Alla", "Livsmedel", "Restaurang", "Transport", "Boende",
        "Hälsa", "Nöje", "Resor", "Elektronik",
        "Abonnemang", "Shopping", "Övrigt"
    ];

    useEffect(() => {
        if (effectRan.current) return;
        effectRan.current = true;

        fetchUserInfo()
            .then(data => setEmail(data.email))
            .catch(() => {
                localStorage.removeItem("jwt");
                sessionStorage.removeItem("jwt");
            });
    }, []);

    useEffect(() => {
        if (ocrData?.receipt) {
            setEditableReceipt(JSON.parse(JSON.stringify(ocrData.receipt)));
        }
    }, [ocrData]);

    useEffect(() => {
        fetchHistoryReceipts()
            .then(setSavedReceipts)
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        if (!historyReceiptId) return;

        setSelectedReceiptId(historyReceiptId);

        const load = async () => {
            try {
                const file = await fetchHistoryReceiptFile(historyReceiptId);
                setUploadedImage(URL.createObjectURL(file));

                const ocr = await rescanReceipt(historyReceiptId, file);
                setOcrData(ocr);

                if (ocr.receipt) {
                    setEditableReceipt(JSON.parse(JSON.stringify(ocr.receipt)));
                }
            } catch (e) {
                console.error(e);
            }
        };

        load();
    }, [historyReceiptId, setOcrData, setSelectedReceiptId, setUploadedImage]);

    const handleInputChange = (field, value) => {
        setEditableReceipt(prev => ({ ...prev, [field]: value }));
    };

    const handleItemChange = (index, field, value) => {
        const items = [...editableReceipt.items];
        items[index] = {
            ...items[index],
            [field]: value,
            itemTotalPrice:
                (field === "itemQuantity" ? value : items[index].itemQuantity) *
                (field === "itemUnitPrice" ? value : items[index].itemUnitPrice)
        };
        setEditableReceipt(prev => ({ ...prev, items }));
    };

    const handleUpload = async e => {
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

            if (data.receipt) setEditableReceipt(JSON.parse(JSON.stringify(data.receipt)));
        } catch (err) {
            console.error("Rescan failed:", err);
        }
    };

    const handleSave = async () => {
        if (!selectedReceiptId || saving) return;

        try {
            setSaving(true);
            await saveReceipt(selectedReceiptId, editableReceipt);

            setSavedReceipts(prev => [...prev, { ...editableReceipt, id: selectedReceiptId, saved: true }]);
            handleNewScan();
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedReceiptId) return;
        try {
            await deleteHistoryReceipt(selectedReceiptId);
            handleNewScan();
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

    const handleItemRemove = index => {
        setEditableReceipt(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    if (!open) return null;

    return (
        <div className="scan-modal-backdrop">
            <button className="scan-modal-close" onClick={onClose}>✕</button>
            <div className="scan-modal">

                <div className="left-modal-side">
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

                <div className="right-modal-side">
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
                                    <p>
                                        <strong style={{ fontSize: "1.2rem" }}>Kategori:</strong>
                                        <select
                                            className="receipt-dropdown"
                                            value={editableReceipt.category || ""}
                                            onChange={e => handleInputChange("category", e.target.value)}
                                        >
                                            <option value="">Välj kategori</option>
                                            {CATEGORIES.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </p>

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

                                    <p><strong>Datum:</strong>
                                        <input
                                            type="text"
                                            value={editableReceipt.receiptDate || ""}
                                            onChange={e =>
                                                handleInputChange("receiptDate", e.target.value)
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
    );
}

export default ScanReceiptsModal;