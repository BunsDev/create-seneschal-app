import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export const CountdownTimer = ({ timeFactor, delay }) => {
  const calculateRemainingTime = (time) => {
    const currentTime = Math.floor(Date.now() / 1000); // Convert current time to seconds
    return time - currentTime;
  };

  const [isEarly, setIsEarly] = useState(delay > Date.now() / 1000);

  const [remainingTime, setRemainingTime] = useState(
    calculateRemainingTime(isEarly ? delay : timeFactor)
  );

  useEffect(() => {
    const intervalId = setInterval(() => {
      let newRemainingTime = calculateRemainingTime(
        isEarly ? delay : timeFactor
      );

      setRemainingTime(newRemainingTime);

      if (newRemainingTime <= 0) {
        if (isEarly) {
          setIsEarly(false);
          newRemainingTime = calculateRemainingTime(timeFactor);
          setRemainingTime(newRemainingTime);
        } else {
          clearInterval(intervalId);
        }
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = remainingSeconds.toString().padStart(2, '0');

    return `${formattedHours} : ${formattedMinutes} : ${formattedSeconds}`;
  };

  return (
    <Button variant='outline' disabled={isEarly}>
      {remainingTime > 0 ? <p>{formatTime(remainingTime)}</p> : <p>Expired</p>}
    </Button>
  );
};
