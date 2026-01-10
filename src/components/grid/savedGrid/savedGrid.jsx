import React from "react";

export default function SavedGrid({ r, image, ocrData }) {
    return (
        <>
            <p className="receipt-vendor">
                {ocrData?.vendorName || "–"}
            </p>

            <p className="receipt-amount">
                {ocrData?.totalAmount !== undefined
                    ? `${ocrData.totalAmount} kr`
                    : "–"}
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