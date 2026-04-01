'use client';

import { useEffect, useState } from 'react';

export interface OrderTimerProps {
  startTime: string;
}

export function OrderTimer({ startTime }: OrderTimerProps) {
  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  useEffect(() => {
    const calculateElapsed = () => {
      const start = new Date(startTime).getTime();
      const now = Date.now();
      const diff = now - start;
      const minutes = Math.floor(diff / 60000);
      setElapsedMinutes(minutes);
    };

    // Calculate immediately
    calculateElapsed();

    // Update every second
    const interval = setInterval(calculateElapsed, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const totalSeconds = elapsedMinutes * 60;

  const getTimerColor = () => {
    if (elapsedMinutes >= 30) {
      return 'text-red-600 bg-red-50';
    }
    if (elapsedMinutes >= 20) {
      return 'text-yellow-600 bg-yellow-50';
    }
    return 'text-gray-600 bg-gray-100';
  };

  const getTimerBgColor = () => {
    if (elapsedMinutes >= 30) {
      return 'bg-red-100 border-red-200';
    }
    if (elapsedMinutes >= 20) {
      return 'bg-yellow-100 border-yellow-200';
    }
    return 'bg-gray-100 border-gray-200';
  };

  return (
    <div
      className={`flex items-center gap-1 px-2 py-1 rounded-md border text-xs font-mono font-semibold ${getTimerBgColor()}`}
    >
      <svg
        className={`w-3 h-3 ${getTimerColor()}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span className={getTimerColor()}>
        {formatTime(totalSeconds)}
      </span>
    </div>
  );
}
