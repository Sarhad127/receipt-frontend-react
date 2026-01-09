import React, { createContext, useContext, useState } from "react";

const ScanContext = createContext();

export const ScanProvider = ({ children }) => {
    const [uploadedFile, setUploadedFile] = useState(null);
    const [uploadedImage, setUploadedImage] = useState(null);
    const [ocrData, setOcrData] = useState(null);
    const [selectedReceiptId, setSelectedReceiptId] = useState(null);

    return (
        <ScanContext.Provider value={{
            uploadedFile,
            setUploadedFile,
            uploadedImage,
            setUploadedImage,
            ocrData,
            setOcrData,
            selectedReceiptId,
            setSelectedReceiptId
        }}>
            {children}
        </ScanContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useScan = () => useContext(ScanContext);