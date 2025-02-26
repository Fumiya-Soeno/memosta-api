import { authenticateUser } from "../../helpers/auth";
import { getActiveEnemyUnit } from "../../helpers/db";

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

    const records = await getActiveEnemyUnit();
    records.rows.sort((a, b) => a.position - b.position);

    return res.status(200).json({ success: true, records: records.rows });
  } catch (error) {
    console.error("エラー:", error);
    return res
      .status(error.status || 500)
      .json({ success: false, message: error.message || "サーバーエラー" });
  }
}
