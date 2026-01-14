import { FaMoon, FaSun } from "react-icons/fa";
import { toggleTheme } from "./utils/theme.js";
import { useState } from "react";

export default function ThemeToggle() {
    const [theme, setTheme] = useState(
        document.documentElement.getAttribute("data-theme") || "light"
    );

    const handleToggle = () => {
        toggleTheme();
        const newTheme = document.documentElement.getAttribute("data-theme");
        setTheme(newTheme);
    };

    return (
        <button
            className="theme-toggle-btn"
            onClick={handleToggle}
            aria-label="Toggle theme"
        >
            {theme === "dark" ? <FaSun /> : <FaMoon />}
        </button>
    );
}