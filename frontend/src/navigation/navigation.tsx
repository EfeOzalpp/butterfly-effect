import React from "react";
import NavLeft from "./left/nav-left";
import NavRight from "./right/nav-right";
import NavBottom from "./bottom/nav-bottom";
import { useAppState } from "../app/store";
import "../styles/navigation.css";

const cx = (...parts: (string | boolean | undefined)[]) => parts.filter(Boolean).join(" ");

const Navigation = () => {
  const { navVisible, darkMode } = useAppState();

  return (
    <>
      <nav className={cx("navigation", !navVisible && "nav-hidden-mobile")}>
        <NavLeft />
        <NavRight isDark={!!darkMode} />
      </nav>
      <NavBottom />
    </>
  );
};

export default Navigation;
