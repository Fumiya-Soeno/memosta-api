import React from "react";

const MeteorIcon: React.FC = () => {
  return (
    <svg
      className="mx-auto my-0"
      width="80"
      height="80"
      viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* 背景用：暗めのラジアルグラデーション */}
        <radialGradient id="bgGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000" />
          <stop offset="100%" stopColor="#1a1a1a" />
        </radialGradient>
        {/* 爆発エフェクト用のラジアルグラデーション */}
        <radialGradient id="explosionGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#ffea00" />
          <stop offset="100%" stopColor="#ff4500" />
        </radialGradient>
        {/* 隕石の軌跡・隕石自体を表現する線形グラデーション */}
        <linearGradient id="meteorGradient" x1="10" y1="10" x2="40" y2="40">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#ff8c00" />
        </linearGradient>
        {/* グロー効果 */}
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
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

      {/* 中央に広がる爆発エフェクト（実際の攻撃は直径300px 相当） */}
      <circle
        cx="40"
        cy="40"
        r="30"
        fill="url(#explosionGradient)"
        filter="url(#glow)"
      />

      {/* 爆発エフェクトから放射するスパーク（簡易表現） */}
      <line
        x1="40"
        y1="40"
        x2="40"
        y2="20"
        stroke="#ff4500"
        strokeWidth="2"
        filter="url(#glow)"
      />
      <line
        x1="40"
        y1="40"
        x2="60"
        y2="40"
        stroke="#ff4500"
        strokeWidth="2"
        filter="url(#glow)"
      />
      <line
        x1="40"
        y1="40"
        x2="40"
        y2="60"
        stroke="#ff4500"
        strokeWidth="2"
        filter="url(#glow)"
      />
      <line
        x1="40"
        y1="40"
        x2="20"
        y2="40"
        stroke="#ff4500"
        strokeWidth="2"
        filter="url(#glow)"
      />

      {/* 左上から中心に向かう隕石の軌跡 */}
      <line
        x1="10"
        y1="10"
        x2="40"
        y2="40"
        stroke="url(#meteorGradient)"
        strokeWidth="6"
        strokeLinecap="round"
        filter="url(#glow)"
      />

      {/* 隕石の頭部 */}
      <circle
        cx="10"
        cy="10"
        r="4"
        fill="url(#meteorGradient)"
        filter="url(#glow)"
      />
    </svg>
  );
};

export default MeteorIcon;
