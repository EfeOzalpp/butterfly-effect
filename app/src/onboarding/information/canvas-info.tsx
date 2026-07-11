
// src/onboarding/information/canvas-info.tsx

import React, { Suspense, useEffect, useRef, useState } from "react";
import PlayPauseIcon from "../../assets/svg/play/PlayPauseIcon";
import { useCanvasRuntime } from "../../app/state/canvas-runtime-context";

const SpotlightEntry = React.lazy(() => import("../../canvas-instances/SpotlightEntry"));

function deferAfterPaint(callback: () => void, delayMs = 180) {
  let cancelled = false;
  let frameId: number | null = null;
  let timerId: number | null = null;

  const run = () => {
    if (cancelled) return;
    timerId = window.setTimeout(() => {
      if (!cancelled) callback();
    }, delayMs);
  };

  frameId = window.requestAnimationFrame(() => {
    frameId = window.requestAnimationFrame(run);
  });

  return () => {
    cancelled = true;
    if (frameId !== null) window.cancelAnimationFrame(frameId);
    if (timerId !== null) window.clearTimeout(timerId);
  };
}

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
  const [spotlightReady, setSpotlightReady] = useState(false);

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
    if (!inView) return;
    return deferAfterPaint(() => {
      setSpotlightReady(true);
    });
  }, [inView]);

  useEffect(() => {
    if (spotlight.paused || !inView) return;
    if (!spotlightReady) return;

    const id = window.setInterval(() => {
      nextSpotlight();
    }, 3000);

    return () => {
      window.clearInterval(id);
    };
  }, [nextSpotlight, spotlight.index, spotlight.paused, inView, spotlightReady]);

  return (
    <aside ref={asideRef} className="onboarding-info canvas-info" aria-label="Scene Canvas information">
      <section className="canvas-info__slider" aria-label="Scene Canvas preview">
        <div className="canvas-info__spotlight-frame">
          {spotlightReady ? (
            <Suspense fallback={<div id="spotlight-canvas-root" className="canvas-info__spotlight-canvas" aria-hidden="true" />}>
              <SpotlightEntry spotlight={spotlight} liveAvg={spotlightLiveAvg} />
            </Suspense>
          ) : (
            <div id="spotlight-canvas-root" className="canvas-info__spotlight-canvas" aria-hidden="true" />
          )}
          <div className="ui-icon-nav canvas-info__slider-controls" aria-label="Scene Canvas preview controls">
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
          <h3 className="canvas-info__eyebrow">Like the scene system?</h3>
          <p className="canvas-info__copy">
            <span>Butterfly Effect's city is powered by Scene Canvas, the custom Canvas2D system behind the live scenery and shape previews.</span>
            <span>I'm building Canvas Engine as a cleaner, reusable renderer for interactive visual tools. Contribute on GitHub or reach out at efe.ozalp@canvas-engine.com.</span>
          </p>
          <div className="canvas-info__actions">
            <a
              className="canvas-engine-link"
              href="https://github.com/EfeOzalpp/canvas-engine"
              target="_blank"
              rel="noreferrer"
              aria-label="Open Canvas Engine repository"
              data-label="View Canvas Engine"
            >
              <span className="canvas-engine-link__ghost" aria-hidden="true">View Canvas Engine</span>
              <span className="canvas-engine-link__inner">View Canvas Engine</span>
            </a>
          </div>
        </div>
      </section>
    </aside>
  );
}
