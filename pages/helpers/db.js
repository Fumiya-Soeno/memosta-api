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

export async function getActiveUnit(userId) {
  return await sql`
    SELECT unit_id FROM active_unit WHERE user_id = ${userId};
  `;
}

export async function updateActiveUnit(userId, unitId) {
  return await sql`
    UPDATE active_unit SET unit_id = ${unitId} WHERE user_id = ${userId}
`;
}

export async function createUnit(userId) {
  const result =
    await sql`INSERT INTO units (user_id) VALUES (${userId}) RETURNING id;`;
  return result.rows[0].id;
}

export async function createCharacter(params) {
  const result = await sql`
    WITH ins AS (
      INSERT INTO characters (name, life, attack, speed, vector, element, skill, special)
      SELECT ${params.name}, ${params.life}, ${params.attack}, ${params.speed}, ${params.vector}, ${params.element}, ${params.skill}, ${params.special}
      WHERE NOT EXISTS (
        SELECT 1 FROM characters WHERE name = ${params.name}
      )
      RETURNING id
    )
    SELECT id FROM ins
    UNION ALL
    SELECT id FROM characters
    WHERE name = ${params.name} AND NOT EXISTS (SELECT 1 FROM ins)
    LIMIT 1
  `;

  return result.rows[0].id;
}

export async function createUnitCharacter(unitId, characterId, position) {
  await sql`INSERT INTO unit_characters (unit_id, character_id, position) VALUES (${unitId}, ${characterId}, ${position});`;
}
