import { sql } from "@vercel/postgres";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // 連勝数TOP 10のランキングを取得
    const { rows: ranking } = await sql`
      SELECT username, streak, win_rate, date
      FROM ranking
      ORDER BY streak DESC, win_rate ASC
      LIMIT 10
    `;

    return res.status(200).json({
      success: true,
      ranking,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
}
