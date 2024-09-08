import { sql } from "@vercel/postgres";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const rankingLimit = 5;

  try {
    // 連勝数ランキング
    const { rows: ranking } = await sql`
      SELECT username, streak, win_rate, date
      FROM ranking
      ORDER BY streak DESC, win_rate ASC
      LIMIT ${rankingLimit}
    `;

    // 連勝率ランキング
    const { rows: winRateRanking } = await sql`
    SELECT username, streak, win_rate, date
    FROM ranking
    ORDER BY win_rate ASC, streak DESC
    LIMIT ${rankingLimit}
  `;

    return res.status(200).json({
      success: true,
      ranking,
      winRateRanking,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
}
