import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./style/pages/HistoryPage.css";
import "./style/AppLayout.css";
import {fetchHistoryReceipts, fetchHistoryReceiptImage, saveReceipt, deleteHistoryReceipt}
from "./api/apis";
import PageHeader, {filterReceipts} from "./Filter/PageHeader.jsx";

function HistoryPage() {
    const navigate = useNavigate();
    const [receipts, setReceipts] = useState([]);
    const [images, setImages] = useState({});
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedReceiptId, setSelectedReceiptId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [quickDate, setQuickDate] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [minAmount, setMinAmount] = useState("");
    const [maxAmount, setMaxAmount] = useState("");
    const [sortOption, setSortOption] = useState("newest");
    const [layout, setLayout] = useState(() => {
        return localStorage.getItem("historyLayout") || "grid";
    });

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
            } catch (err) {
                if (err.response?.status === 401) {
                    localStorage.removeItem("jwt");
                    sessionStorage.removeItem("jwt");
                    navigate("/");
                } else {
                    console.error(err);
                }
            }
        };

        loadHistory();
    }, [navigate]);

    const handleSave = async () => {
        if (!selectedReceiptId || saving) return;
        const receipt = receipts.find(r => r.id === selectedReceiptId);
        if (receipt.saved) {
            alert("Detta kvitto är redan sparat!");
            return;
        }
        try {
            setSaving(true);
            const editable = {
                vendorName: receipt.vendorName,
                vendorOrgNumber: receipt.vendorOrgNumber,
                vendorAddress: receipt.vendorAddress,
                receiptNumber: receipt.receiptNumber,
                receiptDate: receipt.receiptDate,
                totalAmount: receipt.totalAmount,
                vatAmount: receipt.vatAmount,
                currency: receipt.currency,
                paymentMethod: receipt.paymentMethod,
                notes: receipt.notes,
                items: receipt.items
            };
            await saveReceipt(selectedReceiptId, editable);
            setReceipts(prev =>
                prev.map(r =>
                    r.id === selectedReceiptId ? { ...r, saved: true } : r
                )
            );
            setSelectedImage(null);
            setSelectedReceiptId(null);
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
        }
    };

    const filteredReceipts = filterReceipts({
        receipts,
        ocrDataMap: null,
        searchTerm,
        fromDate,
        toDate,
        quickDate,
        selectedCategories,
        minAmount,
        maxAmount,
        sortOption
    });

    const handleLayoutChange = (newLayout) => {
        setLayout(newLayout);
        localStorage.setItem("historyLayout", newLayout);
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
                    setLayout={handleLayoutChange}
                    filtersOpen={filtersOpen}
                    setFiltersOpen={setFiltersOpen}
                    selectedCategories={selectedCategories}
                    setSelectedCategories={setSelectedCategories}
                    minAmount={minAmount}
                    setMinAmount={setMinAmount}
                    maxAmount={maxAmount}
                    setMaxAmount={setMaxAmount}
                    sortOption={sortOption}
                    setSortOption={setSortOption}
                />

                <div className="page-content">
                    {receipts.length === 0 ? null : (
                        <ul className={`receipt-list ${layout}`}>
                            {filteredReceipts.map((r) => (
                                <li
                                    key={r.id}
                                    className={`receipt-item ${layout}`}
                                    onClick={() => {
                                        setSelectedImage(images[r.id]);
                                        setSelectedReceiptId(r.id);
                                    }}
                                >
                                    {layout === "grid" ? (
                                        <>
                                            <p className="receipt-vendor-with-dot">
                                                {r.vendorName || "–"}{" "}
                                                {r.saved && <span className="saved-dot"></span>}
                                            </p>
                                            <p className="receipt-amount">
                                                {r.totalAmount !== undefined ? `${r.totalAmount} ${r.currency}` : "–"}
                                            </p>
                                            <p className="receipt-date">{new Date(r.createdAt).toLocaleDateString()}</p>
                                            {images[r.id] ? (
                                                <img src={images[r.id]} alt="Kvitto" className="receipt-image" />
                                            ) : (
                                                <p>Laddar bild...</p>
                                            )}
                                        </>
                                    ) : (
                                        <div className="list-item">
                                            {images[r.id] ? (
                                                <img src={images[r.id]} alt="Kvitto" className="list-image" />
                                            ) : (
                                                <p>Laddar bild...</p>
                                            )}
                                            <div className="list-info">
                                                <p className="receipt-vendor-with-dot">
                                                    {r.vendorName || "–"} {r.saved && <span className="saved-dot-list"></span>}
                                                </p>
                                                <p>Total: {r.totalAmount} {r.currency}</p>
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
                        <button
                            className="modal-action-btn"
                            onClick={() => {
                                navigate("/skanna", { state: { receiptId: selectedReceiptId } });
                                console.log(selectedReceiptId)
                                setSelectedImage(null);
                            }}
                        >
                            Skanna igen
                        </button>
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