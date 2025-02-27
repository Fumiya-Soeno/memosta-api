import { authenticateUser } from "../../helpers/auth";
import {
  createUnit,
  createCharacter,
  createUnitCharacter,
  updateActiveUnit,
} from "../../helpers/db";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: `Method ${req.method} Not Allowed` });
  }

  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;

  const body = req.body;

  const unitName = body.name;
  const unitNameArray = unitName.split("");

  const unitObject = [];

  unitNameArray.forEach((unitName) => {
    const life = Math.floor(Math.random() * 10) + 1; // 1 ~ 10
    const attack = 11 - life; // lifeに連動（1 ~ 10）
    const speed = Math.floor(Math.random() * 11); // 0 ~ 10
    const skill = Math.floor(Math.random() * 10) + 1; // 1 ~ 10
    const special = Math.floor(Math.random() * 10) + 1; // 1 ~ 10
    const element = Math.floor(Math.random() * 3) + 1; // 1 ~ 3
    const vector = Math.floor(Math.random() * 5) + 1; // 1 ~ 5

    unitObject.push({
      name: unitName,
      life: life * 10,
      attack: attack,
      speed: speed,
      vector: vector,
      element: element,
      skill: skill,
      special: special,
    });
  });

  try {
    const userId = await authenticateUser(accessToken, refreshToken, res);
    const unitId = await createUnit(userId);

    let index = 0;
    for (const character of unitObject) {
      index++;
      const characterId = await createCharacter(character);
      await createUnitCharacter(unitId, characterId, index);
    }
    await updateActiveUnit(userId, unitId);

    return res.status(200).json({ success: true, unitId: unitId });
  } catch (error) {
    console.error("エラー:", error);
    return res
      .status(error.status || 500)
      .json({ success: false, message: error.message || "サーバーエラー" });
  }
}
