"use client";

import React from "react";
import CrossBurstIcon from "./icons/skill/CrossBurstIcon";
import LockOnLaserIcon from "./icons/skill/LockOnLaserIcon";
import PoisonMistIcon from "./icons/special/PoisonMistIcon";
import KyuchiIcon from "./icons/passive/KyuchiIcon";
import PowerUpIcon from "./icons/special/PowerUpIcon";
import TatsujinIcon from "./icons/passive/TatsujinIcon";
import PenetratingDiffusionIcon from "./icons/skill/PenetratingDiffusionIcon";
import EarthQuakeIcon from "./icons/special/EarthQuakeIcon";
import ReflectionIcon from "./icons/passive/ReflectionIcon";

const Icon = ({ name }) => {
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
    case "毒霧":
      icon = <PoisonMistIcon />;
      break;
    case "パワーアップ":
      icon = <PowerUpIcon />;
      break;
    case "アースクエイク":
      icon = <EarthQuakeIcon />;
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
