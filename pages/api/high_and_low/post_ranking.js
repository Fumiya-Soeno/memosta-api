import { sql } from "@vercel/postgres";
import { generateCsrfToken } from "../../../lib/generateCsrfToken";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // クライアントからCSRFトークンを取得
  const clientCsrfToken = req.headers["x-csrf-token"];
  const serverCsrfToken = generateCsrfToken(process.env.JWT_SECRET);

  // トークンの検証
  if (clientCsrfToken !== serverCsrfToken) {
    return res
      .status(403)
      .json({ success: false, message: "Invalid CSRF token" });
  }

  try {
    await sql`BEGIN`; // トランザクション開始

    let { username, streak, winRate, date } = req.body;

    if (username.length > 10) {
      username = username.substring(0, 10);
    }

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
