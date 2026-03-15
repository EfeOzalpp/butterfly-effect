import React from "react";
import NavLeft from "./left/index";
import NavRight from "./right/index";
import NavBottom from "./bottom/index";
import { useAppState } from "../app/store";
import "../styles/navigation.css";
import "../styles/info-graph.css";

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
