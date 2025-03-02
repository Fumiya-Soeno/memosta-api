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
 * @param {number} unitId - ユニットのid
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

export async function getCharacter(name) {
  return await sql`
    SELECT
      c.name, c.life, c.attack, c.speed,
      v.vector,
      e.name AS element_name,
      s.name AS skill_name,
      s.description AS skill_desc,
      sp.name AS special_name,
      sp.description AS special_desc
    FROM characters AS c
    LEFT JOIN vectors v ON c.vector = v.id
    LEFT JOIN elements e ON c.element = e.id
    LEFT JOIN skills s ON c.skill = s.id
    LEFT JOIN specials sp ON c.special = sp.id
    WHERE c.name = ${name};
  `;
}

export async function getCharactersByUnitIdWithoutUserId(unitId) {
  return await sql`
    SELECT
      c.name, c.life, c.attack, c.speed,
      v.vector, uc.position,
      e.name AS element_name,
      s.name AS skill_name,
      sp.name AS special_name,
      p.name AS passive_name,
      u.id
    FROM unit_characters uc
    JOIN units u ON uc.unit_id = u.id
    JOIN characters c ON uc.character_id = c.id
    LEFT JOIN vectors v ON c.vector = v.id
    LEFT JOIN elements e ON c.element = e.id
    LEFT JOIN skills s ON c.skill = s.id
    LEFT JOIN specials sp ON c.special = sp.id
    LEFT JOIN passives p ON c.passive = p.id
    WHERE u.id = ${unitId};
  `;
}

export async function getActiveUnit(userId) {
  return await sql`
    SELECT unit_id FROM active_unit WHERE user_id = ${userId};
  `;
}

export async function getActiveEnemyUnit(unitId) {
  let enemy;
  enemy = await getCharactersByUnitIdWithoutUserId(unitId);
  return enemy;
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

export async function deleteUnit(userId, unitId) {
  return await sql`DELETE FROM units WHERE user_id = ${userId} AND id = ${unitId};`;
}

export async function getTop10() {
  return await sql`
    WITH winrate AS (
      SELECT
        u.id,
        COUNT(DISTINCT w.id) AS win,
        COUNT(DISTINCT l.id) AS loss,
        (COUNT(DISTINCT w.id) * 1.0 / NULLIF(COUNT(DISTINCT w.id) + COUNT(DISTINCT l.id), 0)) AS win_rate
      FROM units u
      LEFT JOIN wins w ON u.id = w.winner
      LEFT JOIN wins l ON u.id = l.loser
      GROUP BY u.id
      HAVING (COUNT(DISTINCT w.id) * 1.0 / NULLIF(COUNT(DISTINCT w.id) + COUNT(DISTINCT l.id), 0)) IS NOT NULL
    ),
    unit_names AS (
      SELECT
        uc.unit_id AS id,
        string_agg(c.NAME, '' ORDER BY uc.id) AS name
      FROM unit_characters uc
      LEFT JOIN characters c ON uc.character_id = c.id
      GROUP BY uc.unit_id
    )
    SELECT
      wr.id,
      un.name,
      wr.win,
      wr.loss,
      wr.win_rate
    FROM winrate wr
    LEFT JOIN unit_names un ON wr.id = un.id
    ORDER BY wr.win_rate DESC
    LIMIT 10;
  `;
}

export async function getNew10() {
  return await sql`
    WITH winrate AS (
      SELECT
        u.id,
        COUNT(DISTINCT w.id) AS win,
        COUNT(DISTINCT l.id) AS loss,
        (COUNT(DISTINCT w.id) * 1.0 / NULLIF(COUNT(DISTINCT w.id) + COUNT(DISTINCT l.id), 0)) AS win_rate
      FROM units u
      LEFT JOIN wins w ON u.id = w.winner
      LEFT JOIN wins l ON u.id = l.loser
      GROUP BY u.id
      HAVING (COUNT(DISTINCT w.id) * 1.0 / NULLIF(COUNT(DISTINCT w.id) + COUNT(DISTINCT l.id), 0)) IS NOT NULL
    ),
    unit_names AS (
      SELECT
        uc.unit_id AS id,
        string_agg(c.NAME, '' ORDER BY uc.id) AS name
      FROM unit_characters uc
      LEFT JOIN characters c ON uc.character_id = c.id
      GROUP BY uc.unit_id
    )
    SELECT
      wr.id,
      un.name,
      wr.win,
      wr.loss,
      wr.win_rate
    FROM winrate wr
    LEFT JOIN unit_names un ON wr.id = un.id
    ORDER BY wr.id DESC
    LIMIT 10;
  `;
}

export async function get10thUnitId() {
  const top10 = await getTop10();
  return top10.rows[9].id;
}

export async function createWin(winner, loser) {
  await sql`
    INSERT INTO wins (winner, loser)
    SELECT ${winner}, ${loser}
    WHERE NOT EXISTS (
      SELECT 1 FROM wins WHERE winner = ${winner} AND loser = ${loser}
    );
  `;
}

export async function getRandomUnfoughtUnit(unitId) {
  const result = await sql`
    WITH candidate_units AS (
      SELECT id
      FROM units
      WHERE id != ${unitId}
    )
    SELECT id
    FROM candidate_units
    WHERE id NOT IN (
      SELECT loser FROM wins WHERE winner = ${unitId}
      UNION
      SELECT winner FROM wins WHERE loser = ${unitId}
    )
    ORDER BY random()
    LIMIT 1;
  `;
  return result.rows[0];
}
