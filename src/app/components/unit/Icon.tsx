"use client";

import React from "react";

import CrossBurstIcon from "./icons/skill/CrossBurstIcon";
import LockOnLaserIcon from "./icons/skill/LockOnLaserIcon";
import PenetratingDiffusionIcon from "./icons/skill/PenetratingDiffusionIcon";
import EchoBladeIcon from "./icons/skill/EchoBladeIcon";
import GuardianFallIcon from "./icons/skill/GuardianFallIcon";
import BlitzShockIcon from "./icons/skill/BlitzShockIcon";
import SpiralShotIcon from "./icons/skill/SpiralShotIcon";
import FlameEdgeIcon from "./icons/skill/FlameEdgeIcon";
import LorenzBurstIcon from "./icons/skill/LorenzBurstIcon";
import ParabolicLauncherIcon from "./icons/skill/ParabolicLauncherIcon";

import PoisonMistIcon from "./icons/special/PoisonMistIcon";
import PowerUpIcon from "./icons/special/PowerUpIcon";
import EarthQuakeIcon from "./icons/special/EarthQuakeIcon";
import DamageWallIcon from "./icons/special/DamageWallIcon";
import MeteorIcon from "./icons/special/MeteorIcon";
import RegenIcon from "./icons/special/RegenIcon";
import HealingIcon from "./icons/special/HealingIcon";
import ShadowDiveIcon from "./icons/special/ShadowDiveIcon";
import VortexBreakIcon from "./icons/special/VortexBreakIcon";
import DoppelgangerIcon from "./icons/special/DoppelgangerIcon";

import TatsujinIcon from "./icons/passive/TatsujinIcon";
import KyuchiIcon from "./icons/passive/KyuchiIcon";
import ReflectionIcon from "./icons/passive/ReflectionIcon";

interface IconProps {
  name: string;
}

const Icon: React.FC<IconProps> = ({ name }) => {
  let icon;
  switch (name) {
    case "十字バースト":
      icon = <CrossBurstIcon />;
      break;
    case "ロックオンレーザー":
      icon = <LockOnLaserIcon />;
      break;
    case "貫通拡散弾":
      icon = <PenetratingDiffusionIcon />;
      break;
    case "エコーブレード":
      icon = <EchoBladeIcon />;
      break;
    case "ガーディアンフォール":
      icon = <GuardianFallIcon />;
      break;
    case "ブリッツショック":
      icon = <BlitzShockIcon />;
      break;
    case "スパイラルショット":
      icon = <SpiralShotIcon />;
      break;
    case "フレイムエッジ":
      icon = <FlameEdgeIcon />;
      break;
    case "ローレンツバースト":
      icon = <LorenzBurstIcon />;
      break;
    case "パラボリックランチャー":
      icon = <ParabolicLauncherIcon />;
      break;

    case "毒霧":
      icon = <PoisonMistIcon />;
      break;
    case "パワーアップ":
      icon = <PowerUpIcon />;
      break;
    case "アースクエイク":
      icon = <EarthQuakeIcon />;
      break;
    case "ダメージウォール":
      icon = <DamageWallIcon />;
      break;
    case "メテオ":
      icon = <MeteorIcon />;
      break;
    case "リジェネ":
      icon = <RegenIcon />;
      break;
    case "ヒーリング":
      icon = <HealingIcon />;
      break;
    case "シャドウダイブ":
      icon = <ShadowDiveIcon />;
      break;
    case "ボルテックスブレイク":
      icon = <VortexBreakIcon />;
      break;
    case "ドッペルゲンガー":
      icon = <DoppelgangerIcon />;
      break;

    case "達人":
      icon = <TatsujinIcon />;
      break;
    case "窮地":
      icon = <KyuchiIcon />;
      break;
    case "反射":
      icon = <ReflectionIcon />;
    default:
      break;
  }

  return icon;
};

export default Icon;
