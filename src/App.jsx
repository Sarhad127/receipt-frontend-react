import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScanProvider } from "./context/ScanContext.jsx";

import LoginPage from "./components/login/LoginPage.jsx";
import HistoryPage from "./components/HistoryPage.jsx";
import ReceiptsPage from "./components/ReceiptsPage.jsx";
import StatisticsPage from "./components/StatisticsPage.jsx";

import "./App.css";
import './components/style/ThemeColor.css';

function App() {
    return (
        <ScanProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<LoginPage />} />
                    <Route path="/kvitton" element={<ReceiptsPage />} />
                    <Route path="/historik" element={<HistoryPage />} />
                    <Route path="/statistik" element={<StatisticsPage />} />
                </Routes>
            </BrowserRouter>
        </ScanProvider>
    );
}

export default App;