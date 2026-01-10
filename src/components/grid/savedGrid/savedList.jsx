import React from "react";

export default function SavedList({ r, image, ocrData }) {
    return (
        <div className="list-item">
            {image ? (
                <img src={image} alt="Kvitto" className="list-image" />
            ) : (
                <p>Laddar bild...</p>
            )}

            <div className="list-info">
                <p className="receipt-vendor-style">
                    {ocrData?.vendorName || "–"}
                </p>

                <p className="receipt-total">
                    Total: {ocrData?.totalAmount !== undefined
                    ? `${ocrData.totalAmount} kr`
                    : "–"}
                </p>

                <p className="receipt-category">
                    Kategori: {ocrData?.category || "–"}
                </p>
            </div>

            <span className="list-date">
                <strong>{new Date(r.createdAt).toLocaleDateString()}</strong>
            </span>
        </div>
    );
}