import jwt from "jsonwebtoken";

export const authenticate = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(401).json({ message: "Authorization token is required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // JWT_SECRETは環境変数に設定
    req.user = decoded; // デコードしたユーザー情報をリクエストに追加
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
};
