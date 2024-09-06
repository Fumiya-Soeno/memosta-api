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

  try {
    await sql`BEGIN`; // トランザクション開始

    let lylics = req.body.lylics.trim();

    await sql`UPDATE cards SET lylics = ${lylics} WHERE id = ${req.body.card_id}`;

    if (req.body.decorations) {
      await sql`DELETE FROM card_decorations WHERE card_id = ${req.body.card_id}`;

      for (const deco of req.body.decorations) {
        await sql`INSERT INTO card_decorations(card_id, start_pos, end_pos, type) VALUES(${req.body.card_id}, ${deco.start_pos}, ${deco.end_pos}, ${deco.type})`;
      }
    }

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
    accessToken: authResult.accessToken,
  });
}
