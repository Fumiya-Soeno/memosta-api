import React from "react";

const VortexBreakIcon: React.FC = () => {
  return (
    <svg
      className="mx-auto my-0"
      width="80"
      height="80"
      viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* 背景の暗めのラジアルグラデーション */}
        <radialGradient id="vortexBg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1a1a2e" />
          <stop offset="100%" stopColor="#000" />
        </radialGradient>
        {/* 渦巻き腕用の線形グラデーション（紫～青） */}
        <linearGradient id="vortexGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8a2be2" />
          <stop offset="100%" stopColor="#00bfff" />
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
        fill="url(#vortexBg)"
        stroke="#333"
        strokeWidth="2"
      />

      {/* 外周に薄く描いた回復オーラ的な円弧 */}
      <circle
        cx="40"
        cy="40"
        r="30"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2"
        strokeDasharray="10 5"
        opacity="0.3"
        filter="url(#glow)"
      />

      {/* 渦巻きを表現する3本の曲線（腕） */}
      <path
        d="M40,40 C51.55,35 68.45,35 75,40"
        fill="none"
        stroke="url(#vortexGradient)"
        strokeWidth="3"
        strokeLinecap="round"
        filter="url(#glow)"
      />
      <path
        d="M40,40 C34.2,51.4 28.45,62.86 22.5,70.31"
        fill="none"
        stroke="url(#vortexGradient)"
        strokeWidth="3"
        strokeLinecap="round"
        filter="url(#glow)"
      />
      <path
        d="M40,40 C34.2,30 28.45,20 22.5,9.69"
        fill="none"
        stroke="url(#vortexGradient)"
        strokeWidth="3"
        strokeLinecap="round"
        filter="url(#glow)"
      />

      {/* 中央の輝くコア */}
      <circle cx="40" cy="40" r="5" fill="#fff" filter="url(#glow)" />
    </svg>
  );
};

export default VortexBreakIcon;
