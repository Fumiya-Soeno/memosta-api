import { authenticateUser } from "../../helpers/auth";
import { getCharactersByUnitId } from "../../helpers/db";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ success: false, message: `Method ${req.method} Not Allowed` });
  }

  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;

  // ✅ `unitId` をクエリパラメータから取得
  const { unitId } = req.query;
  if (!unitId) {
    return res
      .status(400)
      .json({ success: false, message: "ユニットIDが必要です" });
  }

  try {
    const userId = await authenticateUser(accessToken, refreshToken, res);
    const records = await getCharactersByUnitId(unitId, userId);

    return res.status(200).json({ success: true, records: records.rows });
  } catch (error) {
    console.error("エラー:", error);
    return res
      .status(error.status || 500)
      .json({ success: false, message: error.message || "サーバーエラー" });
  }
}
