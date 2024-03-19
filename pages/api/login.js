import { sql } from "@vercel/postgres";
import bcrypt from "bcrypt";
import { generateTokens } from "../helpers/token";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { email, password } = req.body;

  try {
    const records = await sql`SELECT * FROM users WHERE email = ${email}`;

    if (records.rowCount > 0) {
      const user = records.rows[0];
      const match = await bcrypt.compare(password, user.password);

      if (match) {
        // アクセストークンとリフレッシュトークンの生成
        const { accessToken, refreshToken } = generateTokens(user.id);
        return res.status(200).json({
          success: true,
          message: "ログイン成功",
          accessToken,
          refreshToken,
        });
      } else {
        return res.status(401).json({ success: false, message: "認証失敗" });
      }
    } else {
      return res.status(401).json({ success: false, message: "認証失敗" });
    }
  } catch (error) {
    console.error("Database query failed:", error);
    return res.status(500).json({ success: false, message: "サーバーエラー" });
  }
}
