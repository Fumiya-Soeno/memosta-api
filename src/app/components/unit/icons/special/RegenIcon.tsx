import React from "react";

const RegenIcon: React.FC = () => {
  return (
    <svg
      className="mx-auto my-0"
      width="80"
      height="80"
      viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* 柔らかな緑のラジアルグラデーション */}
        <radialGradient id="regenGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e8f5e9" />
          <stop offset="100%" stopColor="#81c784" />
        </radialGradient>
        {/* グロー効果 */}
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* 背景の円 */}
      <circle
        cx="40"
        cy="40"
        r="38"
        fill="url(#regenGradient)"
        stroke="#4caf50"
        strokeWidth="2"
      />

      {/* 回復を象徴する、ほぼ一周した円弧（リジェネの循環エネルギー） */}
      <circle
        cx="40"
        cy="40"
        r="14"
        fill="none"
        stroke="#ffffff"
        strokeWidth="4"
        strokeDasharray="70,20"
        strokeLinecap="round"
        filter="url(#glow)"
      />

      {/* 中央のプラス記号（体力回復を示すシンボル） */}
      <rect
        x="38"
        y="32"
        width="4"
        height="16"
        fill="#ffffff"
        filter="url(#glow)"
      />
      <rect
        x="32"
        y="38"
        width="16"
        height="4"
        fill="#ffffff"
        filter="url(#glow)"
      />
    </svg>
  );
};

export default RegenIcon;
