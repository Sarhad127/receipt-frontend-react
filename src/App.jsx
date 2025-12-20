import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScanProvider } from "./context/ScanContext.jsx";

import LoginPage from "./components/LoginPage.jsx";
import ScanPage from "./components/ScanPage.jsx";
import HistoryPage from "./components/HistoryPage.jsx";
import SavedPage from "./components/SavedPage.jsx";
import SettingsPage from "./components/SettingsPage.jsx";
import StatisticsPage from "./components/StatisticsPage.jsx";
import "./App.css";

function App() {
    return (
        <ScanProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<LoginPage />} />
                    <Route path="/skanna" element={<ScanPage />} />
                    <Route path="/historik" element={<HistoryPage />} />
                    <Route path="/sparade" element={<SavedPage />} />
                    <Route path="/installningar" element={<SettingsPage />} />
                    <Route path="/statistik" element={<StatisticsPage />} />
                </Routes>
            </BrowserRouter>
        </ScanProvider>
    );
}

export default App;