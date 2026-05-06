"use client";

import { useState, useEffect } from "react";

/**
 * Hook to manage match countdown logic.
 * @param {number | string} endTime The time when the match expires.
 * @returns {object} { timeLeft, isWarning, isDanger, isExpired, minutes, seconds }
 */
export function useMatchCountdown(endTime: number | string) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const end = typeof endTime === "number" ? endTime : new Date(endTime).getTime();

    const calculateTimeLeft = () => {
      const now = Date.now();
      return Math.max(0, Math.floor((end - now) / 1000));
    };

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  const isWarning = timeLeft > 0 && timeLeft <= 60; // Last 60 seconds
  const isDanger = timeLeft > 0 && timeLeft <= 10; // Last 10 seconds
  const isExpired = timeLeft === 0;

  return {
    timeLeft,
    isWarning,
    isDanger,
    isExpired,
    minutes,
    seconds
  };
}
