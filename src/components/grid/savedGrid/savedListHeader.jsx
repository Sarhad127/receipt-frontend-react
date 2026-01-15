import React from "react";

export default function SavedListHeader({ onSort, currentSort, currentSortDir }) {
    const columns = [
        { key: "image", label: "Bild" },
        { key: "vendorName", label: "Namn" },
        { key: "createdAt", label: "Datum" },
        { key: "totalAmount", label: "Total" },
        { key: "category", label: "Kategori" },
        { key: "paymentMethod", label: "Betalsätt" },
    ];

    const handleClick = (key) => {
        let dir = "asc";
        if (currentSort === key) {
            dir = currentSortDir === "asc" ? "desc" : "asc";
        }
        onSort(key, dir);
    };

    return (
        <div className="history-list-header">
            {columns.map((col) => (
                <div
                    key={col.key}
                    className="col"
                    style={{ cursor: "pointer", userSelect: "none" }}
                    onClick={() => handleClick(col.key)}
                >
                    {col.label}
                    {currentSort === col.key && (
                        <span>{currentSortDir === "asc" ? " ↑" : " ↓"}</span>
                    )}
                </div>
            ))}
        </div>
    );
}