import React from "react";

const BlitzShockIcon: React.FC = () => {
  return (
    <svg
      className="mx-auto my-0"
      width="80"
      height="80"
      viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* 背景用：暗い天空をイメージしたラジアルグラデーション */}
        <radialGradient id="skyGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0a0a2f" />
          <stop offset="100%" stopColor="#000000" />
        </radialGradient>
        {/* 雷用の線形グラデーション */}
        <linearGradient
          id="lightningGradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#ffff33" />
          <stop offset="100%" stopColor="#ffcc00" />
        </linearGradient>
        {/* グロー（発光）効果 */}
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* 全体の背景：天空を表現する円 */}
      <circle
        cx="40"
        cy="40"
        r="38"
        fill="url(#skyGradient)"
        stroke="#222"
        strokeWidth="2"
      />

      {/* 中心から遠方へ伸びる雷（ジグザグパス） */}
      <path
        d="M40 40 L47 35 L50 30 L57 25 L65 20"
        stroke="url(#lightningGradient)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        filter="url(#glow)"
      />

      {/* 雷の分岐：末端付近で広がるエフェクト */}
      <path
        d="M65 20 L68 18"
        stroke="url(#lightningGradient)"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        filter="url(#glow)"
        opacity="0.7"
      />
      <path
        d="M65 20 L62 16"
        stroke="url(#lightningGradient)"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        filter="url(#glow)"
        opacity="0.7"
      />

      {/* 雷撃の衝撃を示すエフェクト：末端のバースト */}
      <circle
        cx="65"
        cy="20"
        r="6"
        fill="none"
        stroke="#ffcc00"
        strokeWidth="1.5"
        opacity="0.7"
        filter="url(#glow)"
      />
    </svg>
  );
};

export default BlitzShockIcon;
