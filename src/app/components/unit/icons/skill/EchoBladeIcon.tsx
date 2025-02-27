import React from "react";

const EchoBladeIcon: React.FC = () => {
  return (
    <svg
      className="mx-auto my-0"
      width="80"
      height="80"
      viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* 背景のラジアルグラデーション（深いブルー系） */}
        <radialGradient id="backgroundGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1a237e" />
          <stop offset="100%" stopColor="#0d47a1" />
        </radialGradient>
        {/* ブレード用の線形グラデーション */}
        <linearGradient id="bladeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#e0e0e0" />
          <stop offset="100%" stopColor="#9e9e9e" />
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
        fill="url(#backgroundGradient)"
        stroke="#0d47a1"
        strokeWidth="2"
      />

      {/* 中央のブレード（前方に向かう刀身） */}
      <polygon
        points="40,18 46,40 40,62 34,40"
        fill="url(#bladeGradient)"
        stroke="#ccc"
        strokeWidth="1"
        filter="url(#glow)"
      />

      {/* 刀身先端から前方へ放たれる衝撃波（エコー）を3段階で表現 */}
      {/* 第1段目：最も濃いライン */}
      <path
        d="M30,18 A10,10 0 0,1 50,18"
        fill="none"
        stroke="#81d4fa"
        strokeWidth="2"
        filter="url(#glow)"
        opacity="0.8"
      />
      {/* 第2段目 */}
      <path
        d="M28,18 A14,14 0 0,1 52,18"
        fill="none"
        stroke="#81d4fa"
        strokeWidth="2"
        filter="url(#glow)"
        opacity="0.6"
      />
      {/* 第3段目 */}
      <path
        d="M26,18 A18,18 0 0,1 54,18"
        fill="none"
        stroke="#81d4fa"
        strokeWidth="2"
        filter="url(#glow)"
        opacity="0.4"
      />
    </svg>
  );
};

export default EchoBladeIcon;
