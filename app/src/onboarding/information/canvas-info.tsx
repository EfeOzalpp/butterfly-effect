
// src/onboarding/information/canvas-info.tsx

import { useEffect, useRef, useState } from "react";
import SpotlightEntry from "../../canvas-instances/SpotlightEntry";
import PlayPauseIcon from "../../assets/svg/play/PlayPauseIcon";
import { useCanvasRuntime } from "../../app/state/canvas-runtime-context";

export default function CanvasInfo() {
  const {
    spotlightLiveAvg,
    setSpotlightLiveAvg,
    spotlight,
    previousSpotlight,
    nextSpotlight,
    toggleSpotlightPaused,
  } = useCanvasRuntime();

  const asideRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = asideRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => { setInView(entry.isIntersecting); },
      { threshold: 0.6 }
    );
    observer.observe(el);
    return () => { observer.disconnect(); };
  }, []);

  useEffect(() => {
    if (spotlight.paused || !inView) return;

    const id = window.setInterval(() => {
      nextSpotlight();
    }, 3000);

    return () => {
      window.clearInterval(id);
    };
  }, [nextSpotlight, spotlight.index, spotlight.paused, inView]);

  return (
    <aside ref={asideRef} className="onboarding-info canvas-info" aria-label="Canvas Engine information">
      <section className="canvas-info__slider" aria-label="Canvas Engine preview">
        <div className="canvas-info__spotlight-frame">
          <SpotlightEntry spotlight={spotlight} liveAvg={spotlightLiveAvg} />
          <div className="ui-icon-nav canvas-info__slider-controls" aria-label="Canvas Engine preview controls">
            <div className="canvas-info__liveavg-control">
              <div className="canvas-info__liveavg-track" aria-hidden="true" />
              <input
                className="canvas-info__liveavg-slider"
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={spotlightLiveAvg}
                aria-label="Preview intensity"
                onChange={(event) => {
                  setSpotlightLiveAvg(Number(event.currentTarget.value));
                }}
              />
            </div>
            <button type="button" className="ui-icon-nav-button canvas-info__slider-button" aria-label="Previous preview" onClick={previousSpotlight}>
              <svg className="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M15 18L9 12L15 6" />
              </svg>
            </button>
            <button
              type="button"
              className="ui-icon-nav-button canvas-info__slider-button canvas-info__slider-button--pause"
              aria-pressed={spotlight.paused}
              aria-label={spotlight.paused ? "Resume preview" : "Pause preview"}
              onClick={toggleSpotlightPaused}
            >
              <PlayPauseIcon mode={spotlight.paused ? "play" : "pause"} className="ui-icon" />
            </button>
            <button type="button" className="ui-icon-nav-button canvas-info__slider-button" aria-label="Next preview" onClick={nextSpotlight}>
              <svg className="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 18L15 12L9 6" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      <section className="canvas-info__information">
        <div className="canvas-info-div">
          <h3 className="canvas-info__eyebrow">A custom engine for living scenes.</h3>
          <p className="canvas-info__copy">
            <span>Butterfly Effect uses a Canvas2D rendering engine built for compositions with depth and motion.</span>
            <span>Try it out for yourself in your projects, contribute on GitHub or feel free to reach out at efe.ozalp@canvas-engine.com.</span>
          </p>
          <div className="canvas-info__actions">
            <a
              className="canvas-engine-link"
              href="https://github.com/EfeOzalpp/canvas-engine"
              target="_blank"
              rel="noreferrer"
              data-label="Repository"
            >
              <span className="canvas-engine-link__ghost" aria-hidden="true">Repository</span>
              <span className="canvas-engine-link__inner">Repository</span>
            </a>
          </div>
        </div>
      </section>
    </aside>
  );
}
