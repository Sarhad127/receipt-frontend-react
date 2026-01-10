import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./style/pages/HistoryPage.css";
import "./style/AppLayout.css";
import "./grid/grid.css"
import {fetchHistoryReceipts, fetchHistoryReceiptImage, saveReceipt, deleteHistoryReceipt}
from "./api/apis";
import PageHeader, {filterReceipts} from "./Filter/PageHeader.jsx";
import { useScan } from "../context/ScanContext.jsx";
import RightSideHistory from "./right-sidebar/history/RightSideHistory.jsx";
import HistoryList from "./grid/historyGrid/historyList.jsx";
import HistoryGrid from "./grid/historyGrid/historyGrid.jsx";

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
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [minAmount, setMinAmount] = useState("");
    const [maxAmount, setMaxAmount] = useState("");
    const [sortOption, setSortOption] = useState("newest");
    const [selectionMode, setSelectionMode] = useState(false);

    const [gridSize, setGridSize] = useState(() => {
        return localStorage.getItem("savedPageGridSize") || "medium";
    });

    const [layout, setLayout] = useState(() => {
        return localStorage.getItem("historyLayout") || "grid";
    });

    const handleGridSizeChange = (size) => {
        setGridSize(size);
        localStorage.setItem("savedPageGridSize", size);
    };

    const {setUploadedFile,
        setUploadedImage, setOcrData,
        selectedReceiptId: scanSelectedReceiptId,
        setSelectedReceiptId: setScanSelectedReceiptId,
        setEditableReceipt
    } = useScan();
    const [modalOpen, setModalOpen] = useState(false);

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
            if (scanSelectedReceiptId === selectedReceiptId) {
                setUploadedFile(null);
                setUploadedImage(null);
                setOcrData(null);
                setScanSelectedReceiptId(null);
                setEditableReceipt(null);
            }

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

    const handleNavClick = (path) => {
        navigate(path);
    };

    return (
        <div className="page-wrapper">
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <img
                        src="/src/components/style/icons/receipt-icon.png"
                        alt="Kvitto ikon"
                    />
                    <span>Huskvitton</span>
                </div>

                <nav className="sidebar-nav">
                    <div className="sidebar-item" onClick={() => handleNavClick("/skanna")}>Skanna</div>
                    <div className="sidebar-item active">Historik</div>
                    <div className="sidebar-item" onClick={() => handleNavClick("/sparade")}>Sparade</div>
                    <div className="sidebar-item" onClick={() => handleNavClick("/statistik")}>Statistik</div>
                    <div className="sidebar-item" onClick={() => handleNavClick("/installningar")}>Inställningar</div>
                </nav>
            </aside>

            <div className="main-area">
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
                        selectedCategories={selectedCategories}
                        setSelectedCategories={setSelectedCategories}
                        minAmount={minAmount}
                        setMinAmount={setMinAmount}
                        maxAmount={maxAmount}
                        setMaxAmount={setMaxAmount}
                        sortOption={sortOption}
                        setSortOption={setSortOption}
                        gridSize={gridSize}
                        setGridSize={handleGridSizeChange}
                    />

                <div className="page-content">
                    {receipts.length === 0 ? (
                        <div className="empty-state">
                            <p>Inga kvitton</p>
                        </div>
                    ) : (
                        <ul className={`receipt-list ${layout} ${gridSize} ${selectionMode ? "selection-mode" : ""}`}>
                            {filteredReceipts.map((r) => (
                                <li
                                    key={r.id}
                                    className={`receipt-item ${layout} ${selectedReceiptId === r.id ? "selected-receipt" : ""}`}
                                    onClick={() => {
                                        setSelectedImage(images[r.id]);
                                        setSelectedReceiptId(r.id);
                                    }}
                                >
                                    {layout === "grid" ? (
                                        <HistoryGrid
                                            r={r}
                                            image={images[r.id]}
                                            isSelected={selectedReceiptId === r.id}
                                        />
                                    ) : (
                                        <HistoryList
                                            r={r}
                                            image={images[r.id]}
                                        />
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

                <RightSideHistory
                    selectedImage={selectedImage}
                    selectedReceiptId={selectedReceiptId}
                    receipts={receipts}
                    saving={saving}
                    handleSave={handleSave}
                    handleDelete={handleDelete}
                    navigate={navigate}
                    setModalOpen={setModalOpen}
                />

            {modalOpen && selectedImage && (
                <div className="modal-overlay" onClick={() => setModalOpen(false)}>
                    <div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="modal-close"
                            onClick={() => setModalOpen(false)}
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