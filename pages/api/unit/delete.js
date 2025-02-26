import { authenticateUser } from "../../helpers/auth";
import { deleteUnit } from "../../helpers/db";

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res
      .status(405)
      .json({ success: false, message: `Method ${req.method} Not Allowed` });
  }

  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;

  const body = req.body;
  const unitId = body.unitId;

  try {
    const userId = await authenticateUser(accessToken, refreshToken, res);
    const result = await deleteUnit(userId, unitId);

    return res.status(200).json({ success: true, result: result });
  } catch (error) {
    console.error("エラー:", error);
    return res
      .status(error.status || 500)
      .json({ success: false, message: error.message || "サーバーエラー" });
  }
}
