import { sql } from "@vercel/postgres";
import bcrypt from "bcrypt";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { email, password } = req.body;

  try {
    // まずユーザーをメールアドレスで検索
    const records = await sql`SELECT * FROM users WHERE email = ${email}`;

    if (records.rowCount > 0) {
      // ユーザーが見つかった場合、bcryptでパスワードの比較を行う
      const user = records.rows[0];

      const match = await bcrypt.compare(password, user.password);
      if (match) {
        // パスワードが一致した場合
        return res.status(200).json({ success: true, message: "ログイン成功" });
      } else {
        // パスワードが一致しない場合
        return res.status(401).json({ success: false, message: "認証失敗" });
      }
    } else {
      // ユーザーが見つからない場合
      return res.status(401).json({ success: false, message: "認証失敗" });
    }
  } catch (error) {
    console.error("Database query failed:", error);
    return res.status(500).json({ success: false, message: "サーバーエラー" });
  }
}
