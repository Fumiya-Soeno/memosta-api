import { sql } from "@vercel/postgres";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { email, password } = req.body;

  try {
    const records =
      await sql`SELECT * FROM users WHERE email = ${email} AND password = ${password}`;

    if (records.count > 0) {
      // ユーザーが見つかった場合
      return res
        .status(200)
        .json({ success: true, message: "ログイン成功", user: records[0] });
    } else {
      // ユーザーが見つからない場合
      return res.status(401).json({ success: false, message: "認証失敗" });
    }
  } catch (error) {
    console.error("Database query failed:", error);
    return res.status(500).json({ success: false, message: "サーバーエラー" });
  }
}
