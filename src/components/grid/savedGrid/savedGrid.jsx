import React from "react";

export default function SavedGrid({ r, image, ocrData, onExpand }) {
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
                <>
                    <img src={image} alt="Kvitto" className="receipt-image" />
                    <button
                        className="expand-pil"
                        onClick={(e) => {
                            e.stopPropagation();
                            onExpand?.(r.id);
                        }}
                        title="Förstora"
                    >
                        ⤢
                    </button>
                </>
            ) : (
                <p>Laddar bild...</p>
            )}
        </>
    );
}