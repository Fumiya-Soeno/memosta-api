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

  try {
    await sql`INSERT INTO cards(title, lylics, user_id) VALUES(${req.body.title}, '', ${authResult.userId})`;
  } catch (error) {
    console.error(error);
  }

  return res.status(200).json({
    success: true,
    accessToken: authResult.accessToken,
  });
}
