import React from "react";

const LorenzBurstIcon: React.FC = () => {
  return (
    <svg
      className="mx-auto my-0"
      width="80"
      height="80"
      viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* 背景用のラジアルグラデーション（暗め） */}
        <radialGradient id="bgGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000" />
          <stop offset="100%" stopColor="#1a1a1a" />
        </radialGradient>
        {/* 電撃をイメージした線形グラデーション */}
        <linearGradient
          id="electricGradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#00ffff" />
          <stop offset="100%" stopColor="#007acc" />
        </linearGradient>
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

      {/* 正十角形の輪郭（中心を囲む電撃オーラ） */}
      <polygon
        points="40,5 60.57,11.69 73.29,29.11 73.29,50.82 60.57,68.32 40,75 19.43,68.32 6.71,50.82 6.71,29.19 19.43,11.69"
        fill="none"
        stroke="url(#electricGradient)"
        strokeWidth="3"
        filter="url(#glow)"
      />
    </svg>
  );
};

export default LorenzBurstIcon;
