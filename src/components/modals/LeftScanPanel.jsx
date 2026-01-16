import React from "react";

function LeftScanPanel({ uploadedImage, onUpload }) {
    return (
        <div className="left-modal-side">
            <div className="scroll-inner">
                {!uploadedImage && (
                    <div className="left-side-info">
                        <h2>Ladda upp kvitto</h2>
                        <div className="upload-box">
                            <span>Dra & släpp eller klicka för att ladda upp</span>
                            <input type="file" accept="image/*" onChange={onUpload} />
                        </div>
                    </div>
                )}

                {uploadedImage && (
                    <img
                        src={uploadedImage}
                        alt="Uploaded receipt"
                        className="uploaded-image"
                    />
                )}
            </div>
        </div>
    );
}

export default LeftScanPanel;