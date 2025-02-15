import { authenticateUser } from "../../helpers/auth";
import { getActiveUnit } from "../../helpers/db";

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
    const records = await getActiveUnit(userId);
    const rows = records.rows;

    return res.status(200).json({ success: true, rows: rows });
  } catch (error) {
    console.error("エラー:", error);
    return res
      .status(error.status || 500)
      .json({ success: false, message: error.message || "サーバーエラー" });
  }
}
