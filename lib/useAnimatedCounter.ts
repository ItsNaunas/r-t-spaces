"use client";

import { useEffect, useState } from "react";

export function useAnimatedCounter(
  target: number,
  duration: number = 2000,
  startOnMount: boolean = false
) {
  const [count, setCount] = useState(startOnMount ? 0 : target);
  const [hasStarted, setHasStarted] = useState(startOnMount);

  useEffect(() => {
    if (!hasStarted) return;

    let startTime: number | null = null;
    const startValue = 0;

    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentCount = Math.floor(startValue + (target - startValue) * easeOut);

      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    requestAnimationFrame(animate);
  }, [target, duration, hasStarted]);

  const start = () => {
    setCount(0);
    setHasStarted(true);
  };

  return { count, start, hasStarted };
}

