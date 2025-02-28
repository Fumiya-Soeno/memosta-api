import { authenticateUser } from "../../../helpers/auth";
import { getRandomUnfoughtUnit } from "../../../helpers/db";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ success: false, message: `Method ${req.method} Not Allowed` });
  }

  const unitId = req.query.id;
  if (!unitId) {
    return res
      .status(405)
      .json({ success: false, message: `Unit's ID cannot null` });
  }

  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;

  try {
    await authenticateUser(accessToken, refreshToken, res);

    const records = await getRandomUnfoughtUnit(unitId);

    return res.status(200).json({ success: true, unitId: records.id });
  } catch (error) {
    console.error("エラー:", error);
    return res
      .status(error.status || 500)
      .json({ success: false, message: error.message || "サーバーエラー" });
  }
}
