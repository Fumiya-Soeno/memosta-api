import React from "react";

const ParabolicLauncherIcon: React.FC = () => {
  return (
    <svg
      className="mx-auto my-0"
      width="80"
      height="80"
      viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* 背景用のラジアルグラデーション */}
        <radialGradient id="bgGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1a1a1a" />
          <stop offset="100%" stopColor="#000" />
        </radialGradient>
        {/* 爆発用のラジアルグラデーション */}
        <radialGradient id="explosionGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffff00" />
          <stop offset="100%" stopColor="#ff4500" />
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

      {/* 放物線軌道（ダッシュライン） */}
      <path
        d="M15,65 Q40,5 65,25"
        fill="none"
        stroke="#ff9800"
        strokeWidth="2"
        strokeDasharray="4 2"
        filter="url(#glow)"
      />

      {/* 着弾時の爆発エフェクト */}
      <circle
        cx="65"
        cy="25"
        r="4"
        fill="url(#explosionGradient)"
        filter="url(#glow)"
      />
      <line
        x1="65"
        y1="25"
        x2="71"
        y2="25"
        stroke="#ff4500"
        strokeWidth="2"
        filter="url(#glow)"
      />
      <line
        x1="65"
        y1="25"
        x2="69"
        y2="21"
        stroke="#ff4500"
        strokeWidth="2"
        filter="url(#glow)"
      />
      <line
        x1="65"
        y1="25"
        x2="65"
        y2="19"
        stroke="#ff4500"
        strokeWidth="2"
        filter="url(#glow)"
      />
      <line
        x1="65"
        y1="25"
        x2="61"
        y2="21"
        stroke="#ff4500"
        strokeWidth="2"
        filter="url(#glow)"
      />
      <line
        x1="65"
        y1="25"
        x2="59"
        y2="25"
        stroke="#ff4500"
        strokeWidth="2"
        filter="url(#glow)"
      />
      <line
        x1="65"
        y1="25"
        x2="61"
        y2="29"
        stroke="#ff4500"
        strokeWidth="2"
        filter="url(#glow)"
      />
      <line
        x1="65"
        y1="25"
        x2="65"
        y2="31"
        stroke="#ff4500"
        strokeWidth="2"
        filter="url(#glow)"
      />
      <line
        x1="65"
        y1="25"
        x2="69"
        y2="29"
        stroke="#ff4500"
        strokeWidth="2"
        filter="url(#glow)"
      />
    </svg>
  );
};

export default ParabolicLauncherIcon;
