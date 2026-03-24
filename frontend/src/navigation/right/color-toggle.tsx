import React, { useEffect, useRef } from "react";
import { usePreferences } from "../../app/state/preferences-context";

function SunIcon({ className = "", ...props }) {
  return (
    <svg
      className={`ui-icon ${className}`.trim()}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon({ className = "", ...props }) {
  return (
    <svg
      className={`ui-icon ${className}`.trim()}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M22 15.8442C20.6866 16.4382 19.2286 16.7688 17.6935 16.7688C11.9153 16.7688 7.23116 12.0847 7.23116 6.30654C7.23116 4.77135 7.5618 3.3134 8.15577 2C4.52576 3.64163 2 7.2947 2 11.5377C2 17.3159 6.68414 22 12.4623 22C16.7053 22 20.3584 19.4742 22 15.8442Z" />
    </svg>
  );
}

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

  const Icon = darkMode ? SunIcon : MoonIcon;

  return (
    <button
      type="button"
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggle}
      onKeyDown={onKeyDown}
      className={!darkMode ? 'system-color' : 'system-color is-dark'}
    >
      <Icon />
    </button>
  );
}
