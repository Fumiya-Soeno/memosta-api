import React from "react";

const KyuchiIcon: React.FC = () => {
  return (
    <svg
      className="mx-auto my-0"
      width="80"
      height="80"
      viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* 赤系のラジアルグラデーション */}
        <radialGradient id="dangerGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff4d4d" />
          <stop offset="50%" stopColor="#ff0000" />
          <stop offset="100%" stopColor="#8b0000" />
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

      {/* 背景の円（グラデーション＆外枠） */}
      <circle
        cx="40"
        cy="40"
        r="38"
        fill="url(#dangerGradient)"
        stroke="#600"
        strokeWidth="2"
      />

      {/* 中央のエクスクラメーションマーク（縦線） */}
      <rect
        x="38"
        y="16"
        width="4"
        height="32"
        fill="#fff"
        filter="url(#glow)"
      />

      {/* 中央のエクスクラメーションマーク（ドット） */}
      <circle cx="40" cy="56" r="4" fill="#fff" filter="url(#glow)" />

      {/* ダメージを表現するひび割れ（右下側） */}
      <path
        d="M55 65 L52 58 L60 55"
        stroke="#fff"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
        filter="url(#glow)"
      />

      {/* ダメージを表現するひび割れ（左上側） */}
      <path
        d="M25 25 L28 32 L22 35"
        stroke="#fff"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
        filter="url(#glow)"
      />
    </svg>
  );
};

export default KyuchiIcon;
