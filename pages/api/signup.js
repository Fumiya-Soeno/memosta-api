import { sql } from "@vercel/postgres";
import bcrypt from "bcrypt";
import { generateTokens } from "../helpers/token";

const SALT_ROUNDS = 10; // bcryptのソルト生成のためのラウンド数

function commonError(res, error) {
  console.error("Database query failed:", error);
  return res.status(500).json({ success: false, message: "サーバーエラー" });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { email, password } = req.body;

  try {
    const records = await sql`SELECT * FROM users WHERE email = ${email}`;

    if (records.rowCount > 0) {
      // Emailがすでに使われている場合
      return res
        .status(401)
        .json({ success: false, message: "使用できないemail" });
    } else {
      // パスワードのハッシュ化
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      // ハッシュ化されたパスワードを使用してユーザーをデータベースに保存
      await sql`INSERT INTO users(email, password) VALUES(${email}, ${hashedPassword})`;
      const { accessToken, refreshToken } = generateTokens(newUser.id); // newUser.id は新しく登録されたユーザーのID
      return res.status(200).json({
        success: true,
        message: "新規登録に成功",
        accessToken,
        refreshToken,
      });
    }
  } catch (error) {
    return commonError(res, error); // resを渡すように修正
  }
}
