import React from "react";

const SpiralShotIcon: React.FC = () => {
  // 螺旋軌道の各頂点（80x80 px 中心を (40,40) として計算）
  // ※ アーチメデスの螺旋 r = 2 + 2θ (θ: ラジアン) に基づく近似
  // サンプルポイント: θ = 0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0
  // 計算済みの座標（小数点第2位まで）：
  //   θ = 0.0: (40.00, 40.00)
  //   θ = 0.5: (42.63, 41.44)
  //   θ = 1.0: (42.16, 43.37)
  //   θ = 1.5: (40.35, 44.99)
  //   θ = 2.0: (37.50, 45.46)
  //   θ = 2.5: (34.39, 44.19)
  //   θ = 3.0: (32.08, 41.13)
  //   θ = 3.5: (31.57, 36.85)
  //   θ = 4.0: (33.46, 32.43)
  const spiralPath =
    "M40,40 " +
    "L42.63,41.44 " +
    "L42.16,43.37 " +
    "L40.35,44.99 " +
    "L37.50,45.46 " +
    "L34.39,44.19 " +
    "L32.08,41.13 " +
    "L31.57,36.85 " +
    "L33.46,32.43";

  return (
    <svg
      className="mx-auto my-0"
      width="80"
      height="80"
      viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* 背景用ラジアルグラデーション */}
        <radialGradient id="bgGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#2c003e" />
          <stop offset="100%" stopColor="#000" />
        </radialGradient>
        {/* 螺旋ショット用ストロークグラデーション */}
        <linearGradient id="spiralGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ff00ff" />
          <stop offset="100%" stopColor="#800080" />
        </linearGradient>
        {/* グロー効果 */}
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* 背景の外枠円 */}
      <circle
        cx="40"
        cy="40"
        r="38"
        fill="url(#bgGradient)"
        stroke="#333"
        strokeWidth="2"
      />

      {/* 螺旋状の攻撃軌道 */}
      <path
        d={spiralPath}
        fill="none"
        stroke="url(#spiralGradient)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#glow)"
      />

      {/* 軌道先端に弾丸をイメージする小さな円 */}
      <circle cx="33.46" cy="32.43" r="2.5" fill="#fff" filter="url(#glow)" />
    </svg>
  );
};

export default SpiralShotIcon;
