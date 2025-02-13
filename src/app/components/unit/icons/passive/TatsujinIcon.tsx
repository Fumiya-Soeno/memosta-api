import React from "react";

const TatsujinIcon: React.FC = () => {
  return (
    <svg
      className="mx-auto my-0"
      width="80"
      height="80"
      viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* 金色のラジアルグラデーション */}
        <radialGradient id="masterGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff8dc" /> {/* コーンシルク */}
          <stop offset="100%" stopColor="#FFD700" /> {/* ゴールド */}
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

      {/* 外枠の円（グラデーション背景＆枠線） */}
      <circle
        cx="40"
        cy="40"
        r="38"
        fill="url(#masterGradient)"
        stroke="#b8860b"
        strokeWidth="2"
      />

      {/* 中央の星型（達人の象徴） */}
      <polygon
        points="40,28 43.53,35.15 51.41,36.29 45.71,41.85 47.05,49.71 40,46 32.95,49.71 34.29,41.85 28.59,36.29 36.47,35.15"
        fill="#fff"
        filter="url(#glow)"
      />

      {/* 装飾的なドット（上下左右） */}
      <circle cx="40" cy="10" r="3" fill="#fff" filter="url(#glow)" />
      <circle cx="40" cy="70" r="3" fill="#fff" filter="url(#glow)" />
      <circle cx="10" cy="40" r="3" fill="#fff" filter="url(#glow)" />
      <circle cx="70" cy="40" r="3" fill="#fff" filter="url(#glow)" />

      {/* 追加の装飾：小さな点を散らす */}
      <circle
        cx="25"
        cy="25"
        r="2"
        fill="#fff"
        filter="url(#glow)"
        opacity="0.8"
      />
      <circle
        cx="55"
        cy="25"
        r="2"
        fill="#fff"
        filter="url(#glow)"
        opacity="0.8"
      />
      <circle
        cx="25"
        cy="55"
        r="2"
        fill="#fff"
        filter="url(#glow)"
        opacity="0.8"
      />
      <circle
        cx="55"
        cy="55"
        r="2"
        fill="#fff"
        filter="url(#glow)"
        opacity="0.8"
      />
    </svg>
  );
};

export default TatsujinIcon;
