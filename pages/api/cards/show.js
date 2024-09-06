import { sql } from "@vercel/postgres";
import { authenticate } from "../../../lib/authenticate";

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

  // カードの取得(SELECT)処理
  const records =
    await sql`SELECT * FROM cards WHERE user_id = ${authResult.userId}`;

  return res.status(200).json({
    success: true,
    accessToken: authResult.accessToken,
    records: records.rows,
  });
}
