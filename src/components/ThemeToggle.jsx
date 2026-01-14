import { toggleTheme } from "./utils/theme.js";
import { useState, useEffect } from "react";

export default function ThemeToggle() {
    const [theme, setTheme] = useState(
        document.documentElement.getAttribute("data-theme") || "light"
    );

    const handleToggle = () => {
        toggleTheme();
        const newTheme = document.documentElement.getAttribute("data-theme");
        setTheme(newTheme);
    };

    useEffect(() => {
        const observer = new MutationObserver(() => {
            setTheme(document.documentElement.getAttribute("data-theme"));
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
        return () => observer.disconnect();
    }, []);

    return (
        <button
            className={`theme-switch ${theme === "dark" ? "dark" : "light"}`}
            onClick={handleToggle}
            aria-label="Toggle theme"
        >
            <div className="switch-thumb" />
        </button>
    );
}