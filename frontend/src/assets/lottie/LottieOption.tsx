import React, { useRef, useEffect, useState, Suspense } from "react";

const Lottie = React.lazy(() =>
  import(/* webpackChunkName: "lottie-react" */ "lottie-react")
);

const LottieOption = ({ selected, isActive = false }) => {
  const lottieRef = useRef(null);
  const [animationData, setAnimationData] = useState(null);

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

    lottieRef.current.setSpeed(2);

    if (selected) {
      lottieRef.current.setDirection(1);
      lottieRef.current.playSegments([0, 15], true);
    } else {
      lottieRef.current.setDirection(-1);
      lottieRef.current.playSegments([2, 0], true);
    }
  }, [selected, animationData]);

  // hover animation
  useEffect(() => {
    if (!lottieRef.current || selected) return;

    if (isActive) {
      lottieRef.current.setSpeed(2);
      lottieRef.current.setDirection(1);
      lottieRef.current.playSegments([0, 8], true);
    } else {
      lottieRef.current.goToAndStop(0, true);
    }
  }, [isActive, selected]);

  return (
    <div className="radio-button">
      <Suspense fallback={<div className="lottie-skeleton" />}>
        {animationData && (
          <Lottie
            lottieRef={lottieRef}
            animationData={animationData}
            loop={false}
            autoplay={false}
          />
        )}
      </Suspense>
    </div>
  );
};

export default LottieOption;
