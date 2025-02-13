"use client";

import React from "react";
import CrossBurstIcon from "./icons/skill/CrossBurstIcon";
import LockOnLaserIcon from "./icons/skill/LockOnLaserIcon";
import PoisonMistIcon from "./icons/special/PoisonMistIcon";
import KyuchiIcon from "./icons/passive/KyuchiIcon";
import PowerUpIcon from "./icons/special/PowerUpIcon";
import TatsujinIcon from "./icons/passive/TatsujinIcon";

const Icon = ({ name }) => {
  let icon;
  switch (name) {
    case "十字バースト":
      icon = <CrossBurstIcon />;
      break;
    case "ロックオンレーザー":
      icon = <LockOnLaserIcon />;
      break;
    case "毒霧":
      icon = <PoisonMistIcon />;
      break;
    case "パワーアップ":
      icon = <PowerUpIcon />;
      break;
    case "達人":
      icon = <TatsujinIcon />;
      break;
    case "窮地":
      icon = <KyuchiIcon />;
      break;
    default:
      break;
  }

  return icon;
};

export default Icon;
