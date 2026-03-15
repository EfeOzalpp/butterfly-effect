import React, { useRef, useEffect, useState, Suspense } from "react";

const Lottie = React.lazy(() =>
  import(/* webpackChunkName: "lottie-react" */ "lottie-react")
);

const LottieOption = ({ selected, isActive = false }) => {
  const lottieRef = useRef(null);
  const [animationData, setAnimationData] = useState(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduceMotion(!!mq.matches);
    apply();
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", apply);
      return () => mq.removeEventListener("change", apply);
    }
    mq.addListener(apply);
    return () => mq.removeListener(apply);
  }, []);

  // lazy-load animation json
  useEffect(() => {
    let alive = true;

    import(
      /* webpackChunkName:"lottie-radio" */ "./radio-button.json"
    ).then((mod) => {
      if (alive) setAnimationData(mod.default || mod);
    });

    return () => {
      alive = false;
    };
  }, []);

  // selected state animation
  useEffect(() => {
    if (!lottieRef.current) return;

    if (reduceMotion) {
      lottieRef.current.goToAndStop(selected ? 15 : 0, true);
      return;
    }

    lottieRef.current.setSpeed(1.6);

    if (selected) {
      lottieRef.current.setDirection(1);
      lottieRef.current.playSegments([0, 15], true);
    } else {
      lottieRef.current.setDirection(-1);
      lottieRef.current.playSegments([15, 0], true);
    }
  }, [selected, animationData, reduceMotion]);

  // hover animation
  useEffect(() => {
    if (!lottieRef.current || selected || reduceMotion) return;

    if (isActive) {
      lottieRef.current.setSpeed(1.5);
      lottieRef.current.setDirection(1);
      lottieRef.current.playSegments([0, 8], true);
    } else {
      lottieRef.current.goToAndStop(0, true);
    }
  }, [isActive, selected, reduceMotion]);

  return (
    <div className={`radio-button${selected ? " selected" : ""}${isActive ? " active" : ""}`}>
      <Suspense fallback={<div className="lottie-skeleton" />}>
        {animationData ? (
          <Lottie
            lottieRef={lottieRef}
            animationData={animationData}
            loop={false}
            autoplay={false}
          />
        ) : (
          <div className="lottie-skeleton" />
        )}
      </Suspense>
    </div>
  );
};

export default LottieOption;
