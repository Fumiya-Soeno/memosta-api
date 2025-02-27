import { authenticateUser } from "../../../helpers/auth";
import { getTop10 } from "../../../helpers/db";

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
    const records = await getTop10();
    const sortedRecords = records.rows.sort((a, b) => b.win_rate - a.win_rate);

    return res.status(200).json({ success: true, rows: sortedRecords });
  } catch (error) {
    console.error("エラー:", error);
    return res
      .status(error.status || 500)
      .json({ success: false, message: error.message || "サーバーエラー" });
  }
}
