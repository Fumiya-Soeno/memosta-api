import React from "react";

const ShadowDiveIcon: React.FC = () => {
  return (
    <svg
      className="mx-auto my-0"
      width="80"
      height="80"
      viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* 暗めの背景を表現するラジアルグラデーション */}
        <radialGradient id="bgGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#2c2c2c" />
          <stop offset="100%" stopColor="#000" />
        </radialGradient>
        {/* グロー効果 */}
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* マスクによる三日月型エフェクトの作成 */}
        <mask id="crescentMask">
          <rect width="80" height="80" fill="black" />
          {/* 白で描いた大きな円 */}
          <circle cx="40" cy="40" r="30" fill="white" />
          {/* 右側に配置した黒い円で大きな円の一部を隠し、三日月型にする */}
          <circle cx="50" cy="40" r="30" fill="black" />
        </mask>
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

      {/* 三日月型の黒いエフェクト */}
      <circle
        cx="40"
        cy="40"
        r="30"
        fill="#222"
        mask="url(#crescentMask)"
        filter="url(#glow)"
      />
    </svg>
  );
};

export default ShadowDiveIcon;
