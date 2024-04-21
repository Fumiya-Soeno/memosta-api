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

  console.log(req.body);
  try {
    await sql`UPDATE cards SET lylics = ${req.body.lylics} WHERE id = ${req.body.card_id} `;
  } catch (error) {
    console.log(error);
    return res.status(500).end(`Something went wrong`);
  }

  return res.status(200).json({
    success: true,
    accessToken: authResult.accessToken,
  });
}
