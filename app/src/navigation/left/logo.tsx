import { useUiStore } from "../../app/state/ui-store";

const Logo = () => {
  const resetToStart = useUiStore((s) => s.resetToStart);

  return (
    <button
      type="button"
      className="logo-divider"
      aria-label="Back to home"
      onClick={resetToStart}
    ><span className="logo-text" >be</span></button>
  );
};

export default Logo;
