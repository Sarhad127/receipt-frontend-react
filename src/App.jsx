import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./components/LoginPage.jsx";
import HomePage from "./components/HomePage.jsx";
import HistoryPage from "./components/HistoryPage.jsx";
import SavedPage from "./components/SavedPage.jsx";
import SettingsPage from "./components/SettingsPage.jsx";
import "./App.css";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/historik" element={<HistoryPage />} />
                <Route path="/sparade" element={<SavedPage />} />
                <Route path="/installningar" element={<SettingsPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
