"use client";

import React from "react";

interface VectorIndicatorProps {
  arrow: number;
}

const VectorIndicator: React.FC<VectorIndicatorProps> = ({ arrow }) => {
  const angles = [30, 60, 90, 120, 150];

  return (
    <div className="relative w-28 border-b border-gray-700">
      {angles.map((angle, index) => (
        <div
          key={index}
          className={`absolute left-1/4 bottom-0 w-14 border-t ${
            arrow === angle ? "border-red-600" : "border-dashed border-gray-700"
          }`}
          style={{
            transform: `rotate(${angle}deg) translateX(-50%)`,
            transformOrigin: "bottom center",
          }}
        />
      ))}
    </div>
  );
};

export default VectorIndicator;
