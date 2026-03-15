import { useAppState } from "../../app/store";

const Logo = () => {
  const { darkMode } = useAppState();

  return (
    <div className="logo-divider" aria-label="Butterfly Habits">
      <img
        className="logo-image"
        src={darkMode ? "/butterfly-effect-dark.svg" : "/butterfly-effect.svg"}
        alt=""
        aria-hidden="true"
      />
    </div>
  );
};

export default Logo;
