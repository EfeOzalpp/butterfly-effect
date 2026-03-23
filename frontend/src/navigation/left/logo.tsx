import { usePreferences } from "../../app/state/preferences-context";
import { useUiFlow } from "../../app/state/ui-context";

const Logo = () => {
  const { darkMode } = usePreferences();
  const { resetToStart } = useUiFlow();

  return (
    <button
      type="button"
      className="logo-divider"
      aria-label="Back to home"
      onClick={resetToStart}
    >
      <img
        className="logo-image"
        src={darkMode ? "/butterfly-effect-dark.svg" : "/butterfly-effect.svg"}
        alt=""
        aria-hidden="true"
      />
    </button>
  );
};

export default Logo;
