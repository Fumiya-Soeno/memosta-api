import React from "react";

const DoppelgangerIcon: React.FC = () => {
  return (
    <svg
      className="mx-auto my-0"
      width="80"
      height="80"
      viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* 背景用の暗めのラジアルグラデーション */}
        <radialGradient id="bgGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#3a3a3a" />
          <stop offset="100%" stopColor="#000000" />
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
        fill="url(#bgGradient)"
        stroke="#333"
        strokeWidth="2"
      />

      {/* オリジナルのシルエット */}
      <g filter="url(#glow)">
        {/* 頭部 */}
        <circle cx="40" cy="30" r="6" fill="#ffffff" />
        {/* 体部 */}
        <rect x="34" y="36" width="12" height="16" rx="4" fill="#ffffff" />
      </g>

      {/* 複製体（オリジナルよりやや右下、透明度を下げる） */}
      <g filter="url(#glow)" opacity="0.6">
        <circle cx="45" cy="35" r="6" fill="#ffffff" />
        <rect x="39" y="41" width="12" height="16" rx="4" fill="#ffffff" />
      </g>

      {/* 両者を繋ぐ破線（複製関係を表現） */}
      <line
        x1="40"
        y1="30"
        x2="45"
        y2="35"
        stroke="#ffffff"
        strokeWidth="1"
        strokeDasharray="2 2"
        filter="url(#glow)"
      />
    </svg>
  );
};

export default DoppelgangerIcon;
