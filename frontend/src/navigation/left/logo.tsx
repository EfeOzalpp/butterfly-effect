import { useAppState } from "../../app/store";

const Logo = () => {
  const { darkMode, resetToStart } = useAppState();

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
