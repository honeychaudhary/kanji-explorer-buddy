import { useEffect, useState } from "react";

interface Petal {
  id: number;
  left: number;
  animationDuration: number;
  delay: number;
  size: number;
}

export function SakuraBackground() {
  const [petals, setPetals] = useState<Petal[]>([]);

  useEffect(() => {
    const generatePetals = () => {
      const newPetals: Petal[] = [];
      const petalCount = 15; // Reduced for performance

      for (let i = 0; i < petalCount; i++) {
        newPetals.push({
          id: i,
          left: Math.random() * 100,
          animationDuration: 15 + Math.random() * 10, // 15-25 seconds
          delay: Math.random() * 20, // 0-20 seconds delay
          size: 4 + Math.random() * 4, // 4-8px
        });
      }
      
      setPetals(newPetals);
    };

    generatePetals();
  }, []);

  return (
    <div className="sakura-container">
      {petals.map((petal) => (
        <div
          key={petal.id}
          className="sakura-petal"
          style={{
            left: `${petal.left}%`,
            width: `${petal.size}px`,
            height: `${petal.size}px`,
            animationDuration: `${petal.animationDuration}s`,
            animationDelay: `${petal.delay}s`,
          }}
        />
      ))}
    </div>
  );
}