import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./style/pages/SavedPage.css";
import "./style/AppLayout.css";
import {fetchSavedReceipts, fetchReceiptImage, fetchSavedReceiptData, saveReceipt, saveReceiptInfo}
from "./api/apis";
import { filterReceipts } from "/Filter/PageHeader.jsx";

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
    const [searchTerm, setSearchTerm] = useState("");
    const editableRef = useRef(null);
    const [layout, setLayout] = useState("grid");
    const [quickDate, setQuickDate] = useState("");
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [minAmount, setMinAmount] = useState("");
    const [maxAmount, setMaxAmount] = useState("");

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

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (editableRef.current && !editableRef.current.contains(event.target)) {
                setEditingField(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

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
        setEditingField(null);
    };

    const handleInputChange = (field, value) => {
        setEditableReceipt(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...(editableReceipt.items || [])];
        const quantity = field === "itemQuantity" ? parseFloat(value) || 0 : parseFloat(newItems[index].itemQuantity) || 0;
        const unitPrice = field === "itemUnitPrice" ? parseFloat(value) || 0 : parseFloat(newItems[index].itemUnitPrice) || 0;
        newItems[index] = {
            ...newItems[index],
            [field]: field === "itemQuantity" || field === "itemUnitPrice" ? parseFloat(value) || 0 : value,
            itemTotalPrice: quantity * unitPrice
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

            if (!editableReceipt.originalReceiptId) {
                const savedReceiptId = await saveReceipt(selectedReceipt.id, editableReceipt);
                editableReceipt.originalReceiptId = selectedReceipt.id;
                editableReceipt.savedReceiptId = savedReceiptId;
                setOcrDataMap(prev => ({ ...prev, [savedReceiptId]: editableReceipt }));
            } else {
                await saveReceiptInfo(editableReceipt.savedReceiptId, editableReceipt);
                setOcrDataMap(prev => ({ ...prev, [editableReceipt.savedReceiptId]: editableReceipt }));
            }

            setOcrData(editableReceipt);
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const goToNext = () => {
        if (!selectedReceipt) return;

        const currentFilteredIndex = filteredReceipts.findIndex(r => r.id === selectedReceipt.id);
        if (currentFilteredIndex < filteredReceipts.length - 1) {
            const nextReceipt = filteredReceipts[currentFilteredIndex + 1];
            setSelectedReceipt(nextReceipt);
            setEditableReceipt(JSON.parse(JSON.stringify(ocrDataMap[nextReceipt.id])));
            setOcrData(ocrDataMap[nextReceipt.id]);
            setCurrentIndex(currentFilteredIndex + 1);
        }
    };

    const goToPrev = () => {
        if (!selectedReceipt) return;

        const currentFilteredIndex = filteredReceipts.findIndex(r => r.id === selectedReceipt.id);
        if (currentFilteredIndex > 0) {
            const prevReceipt = filteredReceipts[currentFilteredIndex - 1];
            setSelectedReceipt(prevReceipt);
            setEditableReceipt(JSON.parse(JSON.stringify(ocrDataMap[prevReceipt.id])));
            setOcrData(ocrDataMap[prevReceipt.id]);
            setCurrentIndex(currentFilteredIndex - 1);
        }
    };

    const filteredReceipts = filterReceipts({
        receipts,
        ocrDataMap,
        searchTerm,
        fromDate,
        toDate,
        quickDate,
        selectedCategories,
        minAmount,
        maxAmount
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

                <PageHeader
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    quickDate={quickDate}
                    setQuickDate={setQuickDate}
                    fromDate={fromDate}
                    setFromDate={setFromDate}
                    toDate={toDate}
                    setToDate={setToDate}
                    layout={layout}
                    setLayout={setLayout}
                    filtersOpen={filtersOpen}
                    setFiltersOpen={setFiltersOpen}
                    selectedCategories={selectedCategories}
                    setSelectedCategories={setSelectedCategories}
                    minAmount={minAmount}
                    setMinAmount={setMinAmount}
                    maxAmount={maxAmount}
                    setMaxAmount={setMaxAmount}
                />

                <div className="page-content">
                    {receipts.length === 0 ? null : (
                        <ul className={`receipt-list ${layout}`}>
                            {filteredReceipts.map((r, index) => (
                                <li
                                    key={r.id}
                                    className={`receipt-item ${layout}`}
                                    onClick={() => handleReceiptClick(r, index)}
                                >
                                    {layout === "grid" ? (
                                        <>
                                            <p className="receipt-vendor">{ocrDataMap[r.id]?.vendorName || "–"}</p>
                                            <p className="receipt-amount">
                                                {ocrDataMap[r.id]?.totalAmount !== undefined
                                                    ? `${ocrDataMap[r.id].totalAmount} kr`
                                                    : "–"}
                                            </p>
                                            <p className="receipt-date">{new Date(r.createdAt).toLocaleDateString()}</p>
                                            {images[r.id] ? (
                                                <img src={images[r.id]} alt="Kvitto" className="receipt-image" />
                                            ) : <p>Laddar bild...</p>}
                                        </>
                                    ) : (
                                        <div className="list-item">
                                            {images[r.id] ? (
                                                <img src={images[r.id]} alt="Kvitto" className="list-image" />
                                            ) : <p>Laddar bild...</p>}

                                            <div className="list-info">
                                                <p>{ocrDataMap[r.id]?.vendorName || "–"}</p>
                                            </div>
                                            <span className="list-date">
                                                <strong>{new Date(r.createdAt).toLocaleDateString()}</strong>
                                            </span>
                                        </div>

                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                    {filteredReceipts.length === 0 && (
                        <div className="empty-state">
                            <p>Inga kvitton matchar ditt filter</p>
                        </div>
                    )}
                </div>
            </div>

            {modalOpen && selectedReceipt && editableReceipt && (
                <div className="saved-modal-overlay" onClick={closeModal}>
                    <div className="saved-modal-content" onClick={e => e.stopPropagation()}>
                        <button className="saved-modal-close" onClick={closeModal}>×</button>

                        <div className="receipt-navigation">
                            <button onClick={goToPrev} disabled={currentIndex === 0}>Föregående</button>
                            <button onClick={goToNext} disabled={currentIndex === filteredReceipts.length - 1}>Nästa</button>
                        </div>

                        {images[selectedReceipt.id] && (
                            <img
                                src={images[selectedReceipt.id]}
                                alt="Kvitto"
                                className="saved-modal-image"
                                onClick={() => setImageModalOpen(true)}
                            />
                        )}

                        <div className="saved-ocr-info" ref={editableRef}>
                            {[
                                "vendorName",
                                "vendorOrgNumber",
                                "vendorAddress",
                                "receiptDate",
                                "receiptNumber",
                                "paymentMethod",
                                "totalAmount",
                                "vatAmount"
                            ].map(field => (
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
                                            autoFocus
                                            className="saved-ocr-info-placeholder"
                                        />
                                    ) : (
                                        <span onClick={() => setEditingField(field)} className="editable-text">
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