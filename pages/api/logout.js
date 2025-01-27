export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  // クッキーの削除（HttpOnly Cookie を使用している場合）
  res.setHeader("Set-Cookie", [
    `accessToken=; HttpOnly; Path=/; Max-Age=0; Secure; SameSite=Strict`,
  ]);

  res.status(200).json({ success: true, message: "ログアウト成功" });
}
