import { Profiler } from "react";
import Logo from "./logo";
import { profilerOnRender } from "../../dev/renderProfilerStats";

export default function NavLeft({ introActive = false }: { introActive?: boolean }) {
  return (
    <div className={`left${introActive ? " nav-first-enter" : ""}`}>
      <Profiler id="Logo" onRender={profilerOnRender}>
        <Logo />
      </Profiler>
    </div>
  );
}
