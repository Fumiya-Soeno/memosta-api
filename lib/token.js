// token.js
import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.ACCESS_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;

// トークン生成関数
export function generateTokens(userId) {
  const accessToken = jwt.sign({ userId }, ACCESS_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign({ userId }, REFRESH_SECRET, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
}

// トークン検証関数
export function verifyToken(token, type = "access") {
  const secret = type === "access" ? ACCESS_SECRET : REFRESH_SECRET;
  try {
    const decoded = jwt.verify(token, secret);
    return { valid: true, expired: false, decoded };
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return { valid: false, expired: true, decoded: null };
    }
    return { valid: false, expired: false, decoded: null };
  }
}

// トークン更新処理関数
export async function refreshTokens(accessToken, refreshToken) {
  const { valid: accessValid, expired: accessExpired } = verifyToken(
    accessToken,
    "access"
  );
  const { valid: refreshValid, decoded } = verifyToken(refreshToken, "refresh");

  if (accessValid || (accessExpired && refreshValid)) {
    // アクセストークンが有効、またはアクセストークンが切れてリフレッシュトークンが有効な場合、新しいトークンを生成
    const newTokens = generateTokens(decoded.userId);
    return { ...newTokens, userUpdated: true, userId: decoded.userId };
  } else {
    // トークンの更新が不可能な場合
    return { userUpdated: false };
  }
}
