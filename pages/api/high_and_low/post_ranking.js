import { sql } from "@vercel/postgres";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    await sql`BEGIN`; // トランザクション開始

    // リクエストボディからデータを抽出
    let { username, streak, winRate, date } = req.body;

    // usernameが10文字以上の場合、先頭10文字に切り詰める
    if (username.length > 10) {
      username = username.substring(0, 10);
    }

    // データベースにランキング情報を挿入
    await sql`
      INSERT INTO ranking (username, streak, win_rate, date)
      VALUES (${username}, ${streak}, ${winRate}, ${date})
    `;

    await sql`COMMIT`; // トランザクション確定
  } catch (error) {
    await sql`ROLLBACK`; // エラー発生時にはロールバック
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }

  return res.status(200).json({
    success: true,
  });
}
