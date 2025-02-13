import React from "react";

const PoisonMistIcon: React.FC = () => {
  return (
    <svg
      className="mx-auto my-0"
      width="80"
      height="80"
      viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* 毒々しいグラデーション */}
        <radialGradient id="mistGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#a8ff78" stopOpacity="1" />
          <stop offset="100%" stopColor="#78c000" stopOpacity="0.6" />
        </radialGradient>
        {/* グローエフェクト */}
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* 外枠の円 */}
      <circle
        cx="40"
        cy="40"
        r="38"
        fill="none"
        stroke="#78c000"
        strokeWidth="2"
      />

      {/* 毒霧のグループ */}
      <g id="mistGroup" filter="url(#glow)">
        {/* 霧を構成する複数の円 */}
        <circle cx="30" cy="30" r="12" fill="url(#mistGradient)" />
        <circle cx="50" cy="35" r="16" fill="url(#mistGradient)" />
        <circle cx="40" cy="50" r="14" fill="url(#mistGradient)" />
        {/* パーティクル的な小さい円を追加 */}
        <circle cx="25" cy="45" r="3" fill="#a8ff78" />
        <circle cx="55" cy="50" r="2" fill="#a8ff78" />
      </g>
    </svg>
  );
};

export default PoisonMistIcon;
