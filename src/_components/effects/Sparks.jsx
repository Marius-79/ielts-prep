import { useMemo } from "react";

export default function Sparks() {
  const sparks = useMemo(() => {
    return Array.from({ length: 60 }).map(() => ({
      left: Math.random() * 100,
      delay: Math.random() * 10,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 8 + 6,
      opacity: Math.random() * 0.8 + 0.2
    }));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {sparks.map((spark, i) => (
        <span
          key={i}
          className="spark"
          style={{
            left: `${spark.left}%`,
            width: spark.size,
            height: spark.size,
            animationDelay: `${spark.delay}s`,
            animationDuration: `${spark.duration}s`,
            opacity: spark.opacity
          }}
        />
      ))}
    </div>
  );
}