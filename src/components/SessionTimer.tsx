
import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface SessionTimerProps {
  startTime: string;
}

export function SessionTimer({ startTime }: SessionTimerProps) {
  const [duration, setDuration] = useState('');

  useEffect(() => {
    const updateDuration = () => {
      const start = new Date(startTime);
      const now = new Date();
      const diff = now.getTime() - start.getTime();
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setDuration(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    updateDuration();
    const interval = setInterval(updateDuration, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <div className="flex items-center space-x-2 text-lg font-mono bg-gray-50 p-3 rounded-lg">
      <Clock className="h-5 w-5" />
      <span>{duration}</span>
    </div>
  );
}
