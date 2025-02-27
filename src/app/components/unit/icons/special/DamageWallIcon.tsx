import React from "react";

const DamageWallIcon: React.FC = () => {
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
          <stop offset="0%" stopColor="#2c2c2c" />
          <stop offset="100%" stopColor="#000" />
        </radialGradient>
        {/* グロー（発光）効果 */}
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

      {/* ダメージウォールを表す四角形（内側に沿って 3px の赤いライン） */}
      <rect
        x="12"
        y="12"
        width="56"
        height="56"
        fill="none"
        stroke="#ff0000"
        strokeWidth="3"
        filter="url(#glow)"
      />

      {/* 各辺中央に配置する稲妻状のジャギーで危険感を演出 */}
      {/* 上辺 */}
      <polyline
        points="40,12 38,6 42,6 40,12"
        fill="#ff0000"
        filter="url(#glow)"
      />
      {/* 下辺 */}
      <polyline
        points="40,68 38,74 42,74 40,68"
        fill="#ff0000"
        filter="url(#glow)"
      />
      {/* 左辺 */}
      <polyline
        points="12,40 6,38 6,42 12,40"
        fill="#ff0000"
        filter="url(#glow)"
      />
      {/* 右辺 */}
      <polyline
        points="68,40 74,38 74,42 68,40"
        fill="#ff0000"
        filter="url(#glow)"
      />
    </svg>
  );
};

export default DamageWallIcon;
