import React from "react";

const LockOnLaserIcon: React.FC = () => {
  return (
    <svg
      className="mx-auto my-0"
      width="80"
      height="80"
      viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* 背景の外枠用ラジアルグラデーション */}
        <radialGradient id="targetGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#dcdcdc" />
        </radialGradient>
        {/* レーザー光線用の線形グラデーション */}
        <linearGradient id="laserGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ff4136" />
          <stop offset="100%" stopColor="#ff851b" />
        </linearGradient>
        {/* グローエフェクト */}
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* 外枠の円（背景グラデーション付き） */}
      <circle
        cx="40"
        cy="40"
        r="38"
        fill="url(#targetGradient)"
        stroke="#aaa"
        strokeWidth="2"
      />

      {/* レティクルとしての追加の同心円 */}
      <circle
        cx="40"
        cy="40"
        r="20"
        fill="none"
        stroke="#666"
        strokeWidth="1"
        filter="url(#glow)"
      />

      {/* 中心のクロスヘア（縦線） */}
      <line
        x1="40"
        y1="8"
        x2="40"
        y2="72"
        stroke="#333"
        strokeWidth="2"
        filter="url(#glow)"
      />
      {/* 中心のクロスヘア（横線） */}
      <line
        x1="8"
        y1="40"
        x2="72"
        y2="40"
        stroke="#333"
        strokeWidth="2"
        filter="url(#glow)"
      />

      {/* レーザー光線（中心から右上方向へ） */}
      <line
        x1="40"
        y1="40"
        x2="65"
        y2="15"
        stroke="url(#laserGradient)"
        strokeWidth="4"
        strokeLinecap="round"
        filter="url(#glow)"
      />

      {/* 中心のドット */}
      <circle cx="40" cy="40" r="5" fill="#333" filter="url(#glow)" />
    </svg>
  );
};

export default LockOnLaserIcon;
