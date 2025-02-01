import { authenticateUser } from "../../helpers/auth";
import { getUserCharacters } from "../../helpers/db";

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

    let rows = records.rows;

    const grouped = rows.reduce((acc, item) => {
      if (!acc[item.id]) {
        acc[item.id] = [];
      }
      acc[item.id].push(item);
      return acc;
    }, {});

    rows = Object.values(grouped).map((group) =>
      group
        .sort((a, b) => a.position - b.position)
        .map((item) => item.name)
        .join("")
    );

    return res.status(200).json({ success: true, rows: rows });
  } catch (error) {
    console.error("エラー:", error);
    return res
      .status(error.status || 500)
      .json({ success: false, message: error.message || "サーバーエラー" });
  }
}
