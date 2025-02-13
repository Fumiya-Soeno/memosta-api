import React from "react";

const ReflectionIcon: React.FC = () => {
  return (
    <svg
      className="mx-auto my-0"
      width="80"
      height="80"
      viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* 背景のラジアルグラデーション */}
        <radialGradient id="bgGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e0e0e0" />
          <stop offset="100%" stopColor="#a0a0a0" />
        </radialGradient>
        {/* 鏡面用の線形グラデーション */}
        <linearGradient id="mirrorGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#bbb" />
          <stop offset="100%" stopColor="#777" />
        </linearGradient>
        {/* グロー効果 */}
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* 矢印のマーカー */}
        <marker
          id="arrowhead"
          markerWidth="6"
          markerHeight="6"
          refX="0"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 6 3, 0 6" fill="#ff4136" />
        </marker>
      </defs>

      {/* 背景の円 */}
      <circle
        cx="40"
        cy="40"
        r="38"
        fill="url(#bgGradient)"
        stroke="#888"
        strokeWidth="2"
      />

      {/* 傾いた鏡面（反射面）―太めのラインで表現 */}
      <line
        x1="25"
        y1="35"
        x2="55"
        y2="45"
        stroke="url(#mirrorGradient)"
        strokeWidth="6"
        strokeLinecap="round"
        filter="url(#glow)"
      />

      {/* 入射するレーザー光線 */}
      <line
        x1="15"
        y1="60"
        x2="40"
        y2="40"
        stroke="#ff4136"
        strokeWidth="3"
        markerEnd="url(#arrowhead)"
        filter="url(#glow)"
      />

      {/* 反射して飛び出すレーザー光線 */}
      <line
        x1="40"
        y1="40"
        x2="65"
        y2="25"
        stroke="#ff4136"
        strokeWidth="3"
        markerEnd="url(#arrowhead)"
        filter="url(#glow)"
      />
    </svg>
  );
};

export default ReflectionIcon;
