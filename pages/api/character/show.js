import { authenticateUser } from "../../../helpers/auth";
import { getCharacter } from "../../../helpers/db";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ success: false, message: `Method ${req.method} Not Allowed` });
  }

  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;

  try {
    await authenticateUser(accessToken, refreshToken, res);
    const name = req.query.name;
    const records = await getCharacter(name);
    const char = records.rows[0];

    return res.status(200).json({ success: true, char });
  } catch (error) {
    console.error("エラー:", error);
    return res
      .status(error.status || 500)
      .json({ success: false, message: error.message || "サーバーエラー" });
  }
}
