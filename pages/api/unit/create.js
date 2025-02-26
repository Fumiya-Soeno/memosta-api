import { authenticateUser } from "../../helpers/auth";
import {
  createUnit,
  createCharacter,
  createUnitCharacter,
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
    const life = Math.ceil(Math.random() * 10) + 1;
    const attack = 11 - life;
    const speed = Math.ceil(Math.random() * 10) + 1;
    const skill = Math.ceil(Math.random() * 10) + 1;
    const special = Math.ceil(Math.random() * 10) + 1;
    const element = Math.ceil(Math.random() * 3) + 1;
    const vector = Math.ceil(Math.random() * 5) + 1;

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

    return res.status(200).json({ success: true, unitId: unitId });
  } catch (error) {
    console.error("エラー:", error);
    return res
      .status(error.status || 500)
      .json({ success: false, message: error.message || "サーバーエラー" });
  }
}
