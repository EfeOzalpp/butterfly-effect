import React, { useEffect, useRef } from "react";
import { usePreferences } from "../../app/state/preferences-context";
import ThemeIcon from "../../assets/svg/theme/ThemeIcon";

export default function Darkmode() {
  const { darkMode, setDarkMode } = usePreferences();
  const textRef = useRef(darkMode ? "Dark mode" : "Light mode");

  useEffect(() => {
    textRef.current = darkMode ? "Dark mode" : "Light mode";
  }, [darkMode]);

  const toggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDarkMode(!darkMode);
    textRef.current = !darkMode ? "Dark mode" : "Light mode";
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") toggle(e);
  };

  return (
    <button
      type="button"
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggle}
      onKeyDown={onKeyDown}
      className={!darkMode ? 'system-color' : 'system-color is-dark'}
    >
      <ThemeIcon mode={darkMode ? "light" : "dark"} />
    </button>
  );
}
