import React from "react";

const PenetratingDiffusionIcon: React.FC = () => {
  const centerX = 40;
  const centerY = 40;
  const bulletRadius = 2; // 弾の半径（視覚的には存在感を出すための大きさ）
  const distance = 26; // 中心から弾の中心までの距離

  // 16方向に配置する小さな弾（16等分の角度）
  const bullets = Array.from({ length: 16 }).map((_, i) => {
    const angle = (i * 360) / 16;
    const rad = (angle * Math.PI) / 180;
    const cx = centerX + distance * Math.cos(rad);
    const cy = centerY + distance * Math.sin(rad);
    return (
      <circle
        key={i}
        cx={cx}
        cy={cy}
        r={bulletRadius}
        fill="#66ccff"
        filter="url(#glow)"
      />
    );
  });

  return (
    <svg
      className="mx-auto my-0"
      width="80"
      height="80"
      viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* 背景用のラジアルグラデーション */}
        <radialGradient id="diffusionGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e0e0e0" />
          <stop offset="100%" stopColor="#a0a0a0" />
        </radialGradient>
        {/* グロー効果 */}
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
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
        fill="url(#diffusionGradient)"
        stroke="#888"
        strokeWidth="2"
      />

      {/* 中央の発射源を表す小さな円 */}
      <circle cx="40" cy="40" r="4" fill="#444" filter="url(#glow)" />

      {/* 16方向に配置する拡散弾 */}
      {bullets}
    </svg>
  );
};

export default PenetratingDiffusionIcon;
