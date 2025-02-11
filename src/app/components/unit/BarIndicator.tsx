"use client";

import React from "react";

interface BarIndicatorProps {
  label: string; // ラベル (例: "LIFE")
  value: number; // バーの数値 (例: activeChar?.life / 10)
  barColor: string;
}

const BarIndicator: React.FC<BarIndicatorProps> = ({
  label,
  value,
  barColor,
}) => {
  return (
    <div className="flex items-center">
      <span className="w-10 text-right inline-block mr-1">{label}</span>
      <div className="inline-flex items-center">
        {Array.from({ length: 10 }, (_, index) => (
          <span
            key={index}
            className={`w-2 h-4 inline-block mr-0.5 ${
              value <= index ? "bg-gray-700" : barColor
            }`}
          ></span>
        ))}
      </div>
    </div>
  );
};

export default BarIndicator;
