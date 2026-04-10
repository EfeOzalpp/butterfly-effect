import React from "react";
import NavLeft from "./left/nav-left";
import NavRight from "./right/nav-right";
import NavBottom from "./bottom/nav-bottom";
import { usePreferences } from "../app/state/preferences-context";
import "../styles/navigation.css";

const Navigation = () => {
  const { darkMode } = usePreferences();
  const [introActive, setIntroActive] = React.useState(true);

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      setIntroActive(false);
    }, 520);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      <nav className="navigation">
        <NavLeft introActive={introActive} />
        <NavRight isDark={!!darkMode} introActive={introActive} />
      </nav>
      <NavBottom introActive={introActive} />
    </>
  );
};

export default Navigation;
