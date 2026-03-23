import React from "react";
import NavLeft from "./left/nav-left";
import NavRight from "./right/nav-right";
import NavBottom from "./bottom/nav-bottom";
import { usePreferences } from "../app/state/preferences-context";
import "../styles/navigation.css";

const cx = (...parts: (string | boolean | undefined)[]) => parts.filter(Boolean).join(" ");

const Navigation = () => {
  const { navVisible, darkMode } = usePreferences();
  const [introActive, setIntroActive] = React.useState(true);

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      setIntroActive(false);
    }, 520);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      <nav className={cx("navigation", !navVisible && "nav-hidden-mobile")}>
        <NavLeft introActive={introActive} />
        <NavRight isDark={!!darkMode} introActive={introActive} />
      </nav>
      <NavBottom introActive={introActive} />
    </>
  );
};

export default Navigation;
