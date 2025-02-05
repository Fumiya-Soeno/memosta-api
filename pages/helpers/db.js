import { sql } from "@vercel/postgres";

/**
 * ユーザーIDに基づくキャラクター情報を取得
 * @param {number} userId
 * @returns {Promise<Array>} キャラクター情報の配列
 */
export async function getUserCharacters(userId) {
  return await sql`
      SELECT
        c.name,
        uc.position,
        u.id
      FROM unit_characters uc
      JOIN units u ON uc.unit_id = u.id
      JOIN characters c ON uc.character_id = c.id
      WHERE u.user_id = ${userId}`;
}

/**
 * ユニットIDに基づくキャラクター情報を取得
 * @param {number} unitId - ユニットのID
 * @returns {Promise<Array>} キャラクター情報の配列
 */
export async function getCharactersByUnitId(unitId, userId) {
  return await sql`
    SELECT
      c.name, c.life, c.attack, c.speed,
      v.vector, uc.position,
      e.name AS element_name,
      s.name AS skill_name,
      sp.name AS special_name,
      p.name AS passive_name
    FROM unit_characters uc
    JOIN units u ON uc.unit_id = u.id
    JOIN characters c ON uc.character_id = c.id
    LEFT JOIN vectors v ON c.vector = v.id
    LEFT JOIN elements e ON c.element = e.id
    LEFT JOIN skills s ON c.skill = s.id
    LEFT JOIN specials sp ON c.special = sp.id
    LEFT JOIN passives p ON c.passive = p.id
    WHERE u.id = ${unitId}
    AND u.user_id = ${userId};
  `;
}
