import React from "react";

const EarthQuakeIcon: React.FC = () => {
  return (
    <svg
      className="mx-auto my-0"
      width="80"
      height="80"
      viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* 地面をイメージしたラジアルグラデーション */}
        <radialGradient id="earthquakeGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#3e2723" />
          <stop offset="100%" stopColor="#1b0000" />
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

      {/* 外枠の円（背景） */}
      <circle
        cx="40"
        cy="40"
        r="38"
        fill="url(#earthquakeGradient)"
        stroke="#5d4037"
        strokeWidth="2"
      />

      {/* 中央を横断するギザギザの亀裂 */}
      <polyline
        points="10,40 20,30 30,50 40,30 50,50 60,30 70,40"
        fill="none"
        stroke="#ffeb3b"
        strokeWidth="4"
        strokeLinecap="round"
        filter="url(#glow)"
      />

      {/* 亀裂から飛び散る破片 */}
      <path
        d="M20,55 L30,60 L35,55"
        stroke="#ffeb3b"
        strokeWidth="2"
        strokeLinecap="round"
        filter="url(#glow)"
      />
      <path
        d="M50,60 L55,65 L60,60"
        stroke="#ffeb3b"
        strokeWidth="2"
        strokeLinecap="round"
        filter="url(#glow)"
      />

      {/* 破片としての小さな点 */}
      <circle cx="25" cy="65" r="2" fill="#ffeb3b" filter="url(#glow)" />
      <circle cx="55" cy="70" r="2" fill="#ffeb3b" filter="url(#glow)" />
      <circle cx="65" cy="55" r="2" fill="#ffeb3b" filter="url(#glow)" />

      {/* 両端の追加の亀裂部分 */}
      <path
        d="M15,35 L18,32"
        stroke="#ffeb3b"
        strokeWidth="2"
        strokeLinecap="round"
        filter="url(#glow)"
      />
      <path
        d="M65,35 L68,32"
        stroke="#ffeb3b"
        strokeWidth="2"
        strokeLinecap="round"
        filter="url(#glow)"
      />
    </svg>
  );
};

export default EarthQuakeIcon;
