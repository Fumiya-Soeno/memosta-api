import React from "react";

const GuardianFallIcon: React.FC = () => {
  // 中心の座標と隕石を配置する円の半径
  const centerX = 40;
  const centerY = 40;
  const meteorRadius = 28; // 隕石の衝突点を配置する半径
  const tailOffset = 10; // 隕石の尾の長さ

  // 10箇所に配置する隕石
  const meteors = Array.from({ length: 10 }).map((_, i) => {
    const angleDeg = (i * 360) / 10;
    const angleRad = (angleDeg * Math.PI) / 180;
    const meteorX = centerX + meteorRadius * Math.cos(angleRad);
    const meteorY = centerY + meteorRadius * Math.sin(angleRad);
    // 隕石は天空から降下するため、尾は常に上方向（y座標を減少）に描画
    return (
      <g key={i}>
        {/* 隕石の尾（太めのライン） */}
        <line
          x1={meteorX}
          y1={meteorY}
          x2={meteorX}
          y2={meteorY - tailOffset}
          stroke="#ff6f00"
          strokeWidth="2"
          strokeLinecap="round"
          filter="url(#glow)"
        />
        {/* 隕石本体（小さな円） */}
        <circle
          cx={meteorX}
          cy={meteorY}
          r="3"
          fill="url(#meteorGradient)"
          filter="url(#glow)"
        />
        {/* 爆発の兆しを示すエフェクト */}
        <circle
          cx={meteorX}
          cy={meteorY}
          r="6"
          fill="none"
          stroke="#ffeb3b"
          strokeWidth="1"
          opacity="0.7"
          filter="url(#glow)"
        />
      </g>
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
        {/* 背景を天空っぽく表現するラジアルグラデーション */}
        <radialGradient id="skyGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0a0a2f" />
          <stop offset="100%" stopColor="#000000" />
        </radialGradient>
        {/* 隕石本体用のラジアルグラデーション */}
        <radialGradient id="meteorGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#ff6f00" />
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

      {/* 全体の背景 */}
      <circle
        cx={centerX}
        cy={centerY}
        r="38"
        fill="url(#skyGradient)"
        stroke="#333"
        strokeWidth="2"
      />

      {/* 10箇所に召喚された隕石 */}
      {meteors}

      {/* 中央に守護者を象徴するシンプルなサークル */}
      <circle cx={centerX} cy={centerY} r="8" fill="#fff" filter="url(#glow)" />
    </svg>
  );
};

export default GuardianFallIcon;
