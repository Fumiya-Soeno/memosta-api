import { users } from "./users";

export default function handler(req, res) {
  if (req.method === "POST") {
    const { email, password } = req.body;
    const user = users.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      return res
        .status(200)
        .json({ success: true, message: "ログイン成功", userId: user.id });
    } else {
      return res.status(401).json({ success: false, message: "認証失敗" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
