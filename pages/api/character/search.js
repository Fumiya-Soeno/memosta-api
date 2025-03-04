import { authenticateUser } from "../../../helpers/auth";
import { searchCharacter } from "../../../helpers/db";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: `Method ${req.method} Not Allowed` });
  }

  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;

  const { searchLife, searchAttack, searchSpeed, searchSkill, searchSpecial } =
    req.body;

  try {
    await authenticateUser(accessToken, refreshToken, res);

    const life = searchLife ? searchLife * 10 : 0;

    const result = await searchCharacter(
      life,
      searchAttack,
      searchSpeed,
      searchSkill,
      searchSpecial
    );

    const rows = result.rows;

    return res.status(200).json({ success: true, rows });
  } catch (error) {
    console.error("エラー:", error);
    return res
      .status(error.status || 500)
      .json({ success: false, message: error.message || "サーバーエラー" });
  }
}
