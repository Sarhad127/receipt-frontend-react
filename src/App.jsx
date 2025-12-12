import React from "react";
import UploadReceipt from "./components/UploadReceipt";
import "./app.css";

function App() {
    return (
        <div className="app-container">
            <div className="app-content">
                <UploadReceipt />
            </div>
        </div>
    );
}

export default App;
