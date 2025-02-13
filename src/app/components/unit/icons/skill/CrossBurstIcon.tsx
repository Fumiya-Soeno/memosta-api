import React from "react";

const CrossBurstIcon: React.FC = () => {
  return (
    <svg
      className="mx-auto my-0"
      width="80"
      height="80"
      viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* 爆発円用のラジアルグラデーション */}
        <radialGradient id="burstGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff700" />
          <stop offset="100%" stopColor="#ff9800" />
        </radialGradient>
        {/* グロー（発光）フィルター */}
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* アイコン全体の背景（ダークな外枠の円） */}
      <circle
        cx="40"
        cy="40"
        r="38"
        fill="#222"
        stroke="#444"
        strokeWidth="2"
      />

      {/* 中心から上、下、左、右へ伸びるライン */}
      <line
        x1="40"
        y1="40"
        x2="40"
        y2="20"
        stroke="#ff9800"
        strokeWidth="2"
        filter="url(#glow)"
      />
      <line
        x1="40"
        y1="40"
        x2="40"
        y2="60"
        stroke="#ff9800"
        strokeWidth="2"
        filter="url(#glow)"
      />
      <line
        x1="40"
        y1="40"
        x2="20"
        y2="40"
        stroke="#ff9800"
        strokeWidth="2"
        filter="url(#glow)"
      />
      <line
        x1="40"
        y1="40"
        x2="60"
        y2="40"
        stroke="#ff9800"
        strokeWidth="2"
        filter="url(#glow)"
      />

      {/* 各方向に配置する爆発円（直径6px、半径3px） */}
      <circle
        cx="40"
        cy="20"
        r="3"
        fill="url(#burstGradient)"
        filter="url(#glow)"
      />
      <circle
        cx="40"
        cy="60"
        r="3"
        fill="url(#burstGradient)"
        filter="url(#glow)"
      />
      <circle
        cx="20"
        cy="40"
        r="3"
        fill="url(#burstGradient)"
        filter="url(#glow)"
      />
      <circle
        cx="60"
        cy="40"
        r="3"
        fill="url(#burstGradient)"
        filter="url(#glow)"
      />

      {/* 中心のエネルギー放出を象徴する円 */}
      <circle cx="40" cy="40" r="5" fill="#fff" filter="url(#glow)" />
    </svg>
  );
};

export default CrossBurstIcon;
