// 必要な関数のインポート
import { verifyToken, generateTokens, refreshTokens } from "./functions/token";

export default async function handler(req, res) {
  const accessToken = req.headers["authorization"]?.split(" ")[1];
  const refreshToken = req.headers["x-refresh-token"];

  const {
    valid: accessValid,
    expired: accessExpired,
    decoded,
  } = verifyToken(accessToken, "access");

  if (accessValid && decoded?.userId) {
    // アクセストークンが有効で、userIdを取得できた場合
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      generateTokens(decoded.userId);
    return res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } else if (accessExpired && refreshToken) {
    // アクセストークンの有効期限が切れており、リフレッシュトークンが提供されている場合
    const refreshResult = await refreshTokens(refreshToken);
    if (refreshResult.userUpdated) {
      return res.status(200).json({
        success: true,
        accessToken: refreshResult.accessToken,
        refreshToken: refreshResult.refreshToken,
      });
    }
  }

  return res
    .status(401)
    .json({ success: false, message: "トークンの検証に失敗しました" });
}
