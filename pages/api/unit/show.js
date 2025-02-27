import { authenticateUser } from "../../../helpers/auth";
import { getUserCharacters } from "../../../helpers/db";
import { joinedCharactersName } from "../../../helpers/unit";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ success: false, message: `Method ${req.method} Not Allowed` });
  }

  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;

  try {
    const userId = await authenticateUser(accessToken, refreshToken, res);
    const records = await getUserCharacters(userId);

    const rows = joinedCharactersName(records.rows);
    rows.sort((a, b) => b.id - a.id);

    return res.status(200).json({ success: true, rows: rows });
  } catch (error) {
    console.error("エラー:", error);
    return res
      .status(error.status || 500)
      .json({ success: false, message: error.message || "サーバーエラー" });
  }
}
