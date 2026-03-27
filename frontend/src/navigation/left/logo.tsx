import { useUiFlow } from "../../app/state/ui-context";

const Logo = () => {
  const { resetToStart } = useUiFlow();

  return (
    <button
      type="button"
      className="logo-divider"
      aria-label="Back to home"
      onClick={resetToStart}
    >
      <span className="logo-text" aria-hidden="true">be</span>
    </button>
  );
};

export default Logo;
