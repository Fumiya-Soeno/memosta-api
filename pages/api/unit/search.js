import { authenticateUser } from "../../../helpers/auth";
import {} from "../../../helpers/db";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: `Method ${req.method} Not Allowed` });
  }

  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;

  const body = req.body;

  try {
    const userId = await authenticateUser(accessToken, refreshToken, res);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("エラー:", error);
    return res
      .status(error.status || 500)
      .json({ success: false, message: error.message || "サーバーエラー" });
  }
}
