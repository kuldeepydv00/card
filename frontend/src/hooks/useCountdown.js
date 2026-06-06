import { useState, useEffect } from 'react';

const useCountdown = (targetMinute) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const target = new Date(now);
      target.setMinutes(targetMinute, 0, 0);

      if (now.getMinutes() >= targetMinute) {
        target.setHours(target.getHours() + 1);
      }

      const diff = Math.max(0, target.getTime() - now.getTime());
      setTimeLeft(diff);
    }, 1000);

    return () => clearInterval(timer);
  }, [targetMinute]);

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return { timeLeft, formatted: formatTime(timeLeft) };
};

export default useCountdown;
