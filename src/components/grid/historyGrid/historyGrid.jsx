import React from "react";

export default function HistoryGrid({ r, image, isSelected }) {
    return (
        <>
            <p className="receipt-vendor">
                <span className={`saved-dot ${r.saved ? "active" : ""}`}></span>
                {r.vendorName || "–"}
            </p>

            <p className="receipt-amount">
                {r.totalAmount !== undefined ? `${r.totalAmount} ${r.currency}` : "–"}
            </p>

            <p className="receipt-date">
                {new Date(r.createdAt).toLocaleDateString()}
            </p>

            {image ? (
                <img src={image} alt="Kvitto" className="receipt-image" />
            ) : (
                <p>Laddar bild...</p>
            )}
        </>
    );
}