import { sql } from "@vercel/postgres";
import { authenticate } from "../../helpers/authenticate";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const authResult = await authenticate(req);

  if (!authResult.valid) {
    return res
      .status(401)
      .json({ success: false, message: "トークンの検証に失敗しました" });
  }

  const { card_id } = req.body;
  if (!card_id) {
    return res.status(400).json({
      success: false,
      message: "card_idが指定されていません",
    });
  }

  // カード装飾レコードの取得(SELECT)処理
  const records =
    await sql`SELECT start_pos, end_pos, type FROM card_decorations WHERE card_id = ${req.body.card_id}`;

  return res.status(200).json({
    success: true,
    accessToken: authResult.accessToken,
    records: records.rows,
  });
}
