import Logo from "./logo";

export default function NavLeft({ introActive = false }: { introActive?: boolean }) {
  return (
    <div className={`left${introActive ? " nav-first-enter" : ""}`}>
      <Logo />
    </div>
  );
}
