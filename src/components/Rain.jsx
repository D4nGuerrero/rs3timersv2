import { useMemo } from 'react';
import './Rain.css';
import cloud from '/public/cloud.webp';

const CLOUD_COUNT = 28;

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

export default function Rain() {
  const clouds = useMemo(() => {
    return Array.from({ length: CLOUD_COUNT }, (_, i) => ({
      id: i,
      left: randomBetween(0, 100),
      size: randomBetween(36, 80),
      duration: randomBetween(6, 18),
      delay: randomBetween(-18, 2),
      opacity: randomBetween(0.35, 0.85),
    }));
  }, []);

  return (
    <div className="rain-layer" aria-hidden="true">
      {clouds.map((c) => (
        <img
          key={c.id}
          src={cloud}
          className="rain-cloud"
          style={{
            left: `${c.left}%`,
            width: `${c.size}px`,
            animationDuration: `${c.duration}s`,
            animationDelay: `${c.delay}s`,
            opacity: c.opacity,
          }}
          alt=""
        />
      ))}
    </div>
  );
}
