import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./style/pages/SavedPage.css";
import "./style/AppLayout.css";
import {
    fetchSavedReceipts,
    fetchReceiptImage,
    fetchSavedReceiptData,
    saveReceipt
} from "./api/apis";

function SavedPage() {
    const navigate = useNavigate();
    const [receipts, setReceipts] = useState([]);
    const [images, setImages] = useState({});
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [editableReceipt, setEditableReceipt] = useState(null);
    const [ocrData, setOcrData] = useState(null);
    const [ocrDataMap, setOcrDataMap] = useState({});
    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [saving, setSaving] = useState(false);
    const [editingField, setEditingField] = useState(null);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    useEffect(() => {
        const loadReceipts = async () => {
            try {
                const data = await fetchSavedReceipts();
                setReceipts(data);

                const imageMap = {};
                const ocrMap = {};
                for (const r of data) {
                    const imgUrl = await fetchReceiptImage(r.id);
                    if (imgUrl) imageMap[r.id] = imgUrl;

                    const ocr = await fetchSavedReceiptData(r.id);
                    ocrMap[r.id] = ocr;
                }

                setImages(imageMap);
                setOcrDataMap(ocrMap);
            } catch (err) {
                localStorage.removeItem("jwt");
                sessionStorage.removeItem("jwt");
                navigate("/");
            }
        };
        loadReceipts();
    }, [navigate]);

    const handleReceiptClick = (receipt, index) => {
        setSelectedReceipt(receipt);
        setEditableReceipt(JSON.parse(JSON.stringify(ocrDataMap[receipt.id])));
        setOcrData(ocrDataMap[receipt.id]);
        setCurrentIndex(index);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedReceipt(null);
        setEditableReceipt(null);
        setOcrData(null);
    };

    const handleInputChange = (field, value) => {
        setEditableReceipt(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...(editableReceipt.items || [])];
        newItems[index] = {
            ...newItems[index],
            [field]: value,
            itemTotalPrice:
                (field === "itemQuantity" ? value : newItems[index].itemQuantity) *
                (field === "itemUnitPrice" ? value : newItems[index].itemUnitPrice)
        };
        setEditableReceipt(prev => ({ ...prev, items: newItems }));
    };

    const handleItemRemove = (index) => {
        setEditableReceipt(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const handleItemAdd = () => {
        const newItem = {
            itemName: "",
            itemQuantity: 1,
            itemUnitPrice: 0,
            itemTotalPrice: 0
        };
        setEditableReceipt(prev => ({
            ...prev,
            items: [...(prev.items || []), newItem]
        }));
    };

    const handleSave = async () => {
        if (!selectedReceipt || !editableReceipt || saving) return;
        try {
            setSaving(true);
            await saveReceipt(selectedReceipt.id, editableReceipt);
            setOcrData(editableReceipt);
            setOcrDataMap(prev => ({ ...prev, [selectedReceipt.id]: editableReceipt }));
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const goToNext = () => {
        if (currentIndex < receipts.length - 1) {
            const nextIndex = currentIndex + 1;
            const nextReceipt = receipts[nextIndex];
            setCurrentIndex(nextIndex);
            setSelectedReceipt(nextReceipt);
            setEditableReceipt(JSON.parse(JSON.stringify(ocrDataMap[nextReceipt.id])));
            setOcrData(ocrDataMap[nextReceipt.id]);
        }
    };

    const goToPrev = () => {
        if (currentIndex > 0) {
            const prevIndex = currentIndex - 1;
            const prevReceipt = receipts[prevIndex];
            setCurrentIndex(prevIndex);
            setSelectedReceipt(prevReceipt);
            setEditableReceipt(JSON.parse(JSON.stringify(ocrDataMap[prevReceipt.id])));
            setOcrData(ocrDataMap[prevReceipt.id]);
        }
    };

    const filteredReceipts = receipts.filter(r => {
        if (!fromDate && !toDate) return true;

        const receiptDate = new Date(r.createdAt);
        receiptDate.setHours(0, 0, 0, 0);

        if (fromDate) {
            const from = new Date(fromDate);
            if (receiptDate < from) return false;
        }

        if (toDate) {
            const to = new Date(toDate);
            to.setHours(23, 59, 59, 999);
            if (receiptDate > to) return false;
        }

        return true;
    });

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
                <div className="page-header">
                    <div className="date-filter">
                        <div className="date-input">
                            <label>Från</label>
                            <input
                                type="date"
                                value={fromDate}
                                onChange={e => setFromDate(e.target.value)}
                            />
                        </div>

                        <div className="date-input">
                            <label>Till</label>
                            <input
                                type="date"
                                value={toDate}
                                onChange={e => setToDate(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="page-content">
                    {receipts.length === 0 ? null : (
                        <ul className="receipt-list">
                            {filteredReceipts.map((r, index) => (
                                <li
                                    key={r.id}
                                    className="receipt-item"
                                    onClick={() => handleReceiptClick(r, index)}
                                >
                                    <p>{new Date(r.createdAt).toLocaleDateString()}</p>
                                    {images[r.id] ? (
                                        <img src={images[r.id]} alt="Kvitto" className="receipt-image" />
                                    ) : <p>Laddar bild...</p>}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {modalOpen && selectedReceipt && editableReceipt && (
                <div className="saved-modal-overlay" onClick={closeModal}>
                    <div className="saved-modal-content" onClick={e => e.stopPropagation()}>
                        <button className="saved-modal-close" onClick={closeModal}>×</button>

                        <div className="receipt-navigation">
                            <button onClick={goToPrev} disabled={currentIndex === 0}>← Föregående</button>
                            <button onClick={goToNext} disabled={currentIndex === receipts.length - 1}>Nästa →</button>
                        </div>

                        {images[selectedReceipt.id] && (
                            <img
                                src={images[selectedReceipt.id]}
                                alt="Kvitto"
                                className="saved-modal-image"
                                onClick={() => setImageModalOpen(true)}
                            />
                        )}

                        <div className="saved-ocr-info">
                            {["vendorName","vendorOrgNumber","vendorAddress","receiptDate","receiptNumber","paymentMethod","totalAmount","vatAmount"].map(field => (
                                <p key={field}>
                                    <strong>{{
                                        vendorName: "Butik",
                                        vendorOrgNumber: "Org.nr",
                                        vendorAddress: "Adress",
                                        receiptDate: "Datum",
                                        receiptNumber: "Kvittonummer",
                                        paymentMethod: "Betalningsmetod",
                                        totalAmount: "Totalt belopp",
                                        vatAmount: "Moms"
                                    }[field]}:</strong>{" "}
                                    {editingField === field ? (
                                        <input
                                            type={field.includes("Amount") || field === "vatAmount" ? "number" : "text"}
                                            value={editableReceipt[field] || ""}
                                            onChange={e => handleInputChange(field, e.target.value)}
                                            onBlur={() => setEditingField(null)}
                                        />
                                    ) : (
                                        <span
                                            onClick={() => setEditingField(field)}
                                        >
                                {editableReceipt[field] || "–"}
                            </span>
                                    )}
                                </p>
                            ))}

                            <p><strong>Artiklar:</strong></p>
                            {editableReceipt.items && editableReceipt.items.length > 0 && (
                                <ul className="saved-ocr-info">
                                    {editableReceipt.items.map((item, idx) => (
                                        <li key={idx} className="receipt-item-row">
                                            <button
                                                className="remove-item"
                                                onClick={() => handleItemRemove(idx)}
                                                title="Ta bort"
                                            >
                                                ×
                                            </button>

                                            {["itemName", "itemQuantity", "itemUnitPrice"].map(subField => (
                                                editingField === `item-${idx}-${subField}` ? (
                                                    <input
                                                        key={subField}
                                                        type={subField === "itemName" ? "text" : "number"}
                                                        value={item[subField]}
                                                        placeholder={{
                                                            itemName: "Artikelnamn",
                                                            itemQuantity: "Antal",
                                                            itemUnitPrice: "Pris/st"
                                                        }[subField]}
                                                        onChange={e => handleItemChange(
                                                            idx,
                                                            subField,
                                                            subField === "itemName" ? e.target.value : parseFloat(e.target.value)
                                                        )}
                                                        onBlur={() => setEditingField(null)}
                                                        autoFocus
                                                        className="inline-edit-input"
                                                    />
                                                ) : (
                                                    <span
                                                        key={subField}
                                                        onClick={() => setEditingField(`item-${idx}-${subField}`)}
                                                        className="inline-edit-span"
                                                    >
                                                        {item[subField] || {
                                                            itemName: "Artikelnamn",
                                                            itemQuantity: "Antal",
                                                            itemUnitPrice: "Pris/st"
                                                        }[subField]}
                                                    </span>
                                                )
                                            ))}

                                            <span className="item-total">= {item.itemTotalPrice}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <button className="add-item" onClick={handleItemAdd}>Lägg till artikel</button>
                            <button className="save-receipt" onClick={handleSave} disabled={saving}>
                                {saving ? "Sparar..." : "Spara"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {imageModalOpen && images[selectedReceipt?.id] && (
                <div className="image-modal-overlay" onClick={() => setImageModalOpen(false)}>
                    <div className="image-modal-content" onClick={e => e.stopPropagation()}>
                        <button className="image-modal-close" onClick={() => setImageModalOpen(false)}>×</button>
                        <img src={images[selectedReceipt.id]} alt="Förstorad kvittobild" className="image-modal-image" />
                    </div>
                </div>
            )}
        </div>
    );
}

export default SavedPage;