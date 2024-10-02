import { sql } from "@vercel/postgres";
import { generateCsrfToken } from "../../../lib/generateCsrfToken";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const csrfToken = generateCsrfToken("your_secret_key");

  try {
    // ランキングデータの取得
    const rankingLimit = 5;
    const { rows: ranking } = await sql`
      SELECT username, streak, win_rate, date
      FROM ranking
      ORDER BY streak DESC, win_rate ASC
      LIMIT ${rankingLimit}
    `;

    const { rows: winRateRanking } = await sql`
      SELECT username, streak, win_rate, date
      FROM ranking
      ORDER BY win_rate ASC, streak DESC
      LIMIT ${rankingLimit}
    `;

    // CSRFトークンをクライアントに送信
    res.status(200).json({
      success: true,
      csrfToken,
      ranking,
      winRateRanking,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
}
